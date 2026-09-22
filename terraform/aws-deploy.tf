# Infra da Aula 3: sobe o conversor-temperatura numa AWS real, atrás de
# load balancer + auto scaling, seguindo o roteiro da aula (Load Balancer +
# Auto Scaling Group + Health Check). Não roda Docker porque o projeto é só
# HTML/JS estático, então uso a versão com start.sh em vez da versão com
# Dockerfile.
#
# Não apliquei isso numa conta AWS de verdade (geraria custo com o load
# balancer rodando por hora e eu não tenho conta de estudos configurada).
# Ficou só como o arquivo pedido na atividade, validado com `terraform
# validate` localmente.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

variable "repo_url" {
  description = "URL do repositório do projeto (precisa ter um start.sh na raiz)"
  type        = string
  default     = "https://github.com/pschlbeatriz/conversor-temperatura.git"
}

variable "repo_branch" {
  description = "Branch a usar no deploy"
  type        = string
  default     = "main"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "conversor_sg" {
  name        = "conversor-sg"
  description = "Libera HTTP para o conversor de temperatura"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

locals {
  user_data_script = <<-EOF
    #!/bin/bash
    yum install -y git
    git clone --branch ${var.repo_branch} ${var.repo_url} /app
    cd /app
    chmod +x start.sh
    nohup ./start.sh > /var/log/app.log 2>&1 &
  EOF
}

resource "aws_launch_template" "conversor_server" {
  name_prefix   = "conversor-server-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  vpc_security_group_ids = [aws_security_group.conversor_sg.id]
  user_data              = base64encode(local.user_data_script)
}

resource "aws_lb" "conversor_lb" {
  name               = "conversor-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.conversor_sg.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "conversor_tg" {
  name     = "conversor-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    interval            = 15
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "conversor_listener" {
  load_balancer_arn = aws_lb.conversor_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.conversor_tg.arn
  }
}

resource "aws_autoscaling_group" "conversor_asg" {
  name                = "conversor-asg"
  min_size            = 2
  max_size            = 4
  desired_capacity    = 2
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.conversor_tg.arn]
  health_check_type   = "ELB"

  launch_template {
    id      = aws_launch_template.conversor_server.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "conversor-server"
    propagate_at_launch = true
  }
}

output "conversor_url" {
  value = "http://${aws_lb.conversor_lb.dns_name}"
}
