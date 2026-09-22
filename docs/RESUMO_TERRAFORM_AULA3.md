# Resumo - atividade de Terraform (Aula 3)

Arquivo: `terraform-aws/aws-deploy.tf` (pasta separada do `terraform/` do mini projeto porque os dois têm um bloco `required_providers` diferente, um usa provider local e o outro AWS, e não dá pra ter dois num mesmo diretório).

A ideia do exercício é a mesma que a professora mostrou em aula, só que adaptada pro meu projeto: em vez de subir um servidor único, o Terraform descreve um grupo de servidores atrás de um load balancer, com auto scaling group garantindo que sempre tenha pelo menos 2 instâncias no ar. Se uma cair, o health check do load balancer percebe e o ASG sobe outra sozinho.

O "vínculo" com o meu projeto acontece no `user_data` do launch template: quando a instância nasce, ela clona o repositório do conversor-temperatura e executa um `start.sh` que eu criei na raiz do projeto. Esse script só faz `npm ci` e sobe o `serve` na porta 80.

A parte mais difícil foi entender que meu projeto não tem Dockerfile, então o exemplo pronto da aula (que builda uma imagem Docker) não servia direto. Usei a variação sem Docker do material, que baixa o repo e roda um script de start em vez de buildar container. Também tive que prestar atenção que a aplicação precisa rodar exatamente na porta 80 (a mesma liberada no security group e usada pelo target group), porque o `serve` por padrão sobe em outra porta, e se isso não bater o health check nunca passa e o load balancer fica derrubando a instância.

Não cheguei a rodar `terraform apply` numa conta AWS de verdade, porque o load balancer gera custo mesmo dentro do free tier e eu não tenho conta de estudos configurada. Deixei só a etapa de escrever e revisar o código.
