# Introdução a IaC sem nuvem: "publica" a tela copiando os arquivos de ../web
# para uma pasta local. O Terraform cria, atualiza e remove os arquivos sozinho.
terraform {
  required_version = ">= 1.5"
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = ">= 2.0"
    }
  }
}

variable "pasta_destino" {
  description = "Pasta local onde o site será publicado"
  type        = string
  default     = "publicado"
}

resource "local_file" "site" {
  for_each = fileset("${path.module}/../web", "*")
  filename = "${path.module}/${var.pasta_destino}/${each.value}"
  content  = file("${path.module}/../web/${each.value}")
}

output "arquivos_publicados" {
  value = [for f in local_file.site : f.filename]
}
