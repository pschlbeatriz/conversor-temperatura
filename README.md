# Conversor de Temperatura (Celsius ⇄ Fahrenheit)

Mini projeto da disciplina Automação com DevOps e IA Generativa.
Autora: Beatriz Paschoal Floriano.

| Requisito | Onde está |
|-----------|-----------|
| Tela simples | `web/index.html` + `web/main.js` |
| Lógica de conversão | `web/converter.js` |
| Testes (Jest, acertos e erros) + cobertura | `test/`, `npm run coverage` (mínimo 90%) |
| Linter | ESLint, `npm run lint` |
| Pipeline CI | `.github/workflows/ci.yml` |
| IA revisando testes | `scripts/ai-review.js` (job `revisao-ia`) e `docs/REVISAO_IA.md` |
| Terraform (local, sem conta em nuvem) | `terraform/main.tf` |

## Rodar localmente

```bash
npm ci
npm run lint
npm test              # só os testes (Jest)
npm run coverage      # testes + cobertura, falha se < 90%; relatório HTML em coverage/lcov-report/index.html
npm start             # abre a tela em http://localhost:3000
```

Precisa de Node 20 ou superior.

## Pipeline (`ci.yml`)

Roda em todo PR para `main` e em push na `main`, com 3 jobs:

1. **qualidade:** `npm ci`, lint, testes e cobertura (o relatório fica no artefato `cobertura`).
2. **terraform:** `terraform fmt -check`, `init -backend=false` e `validate`.
3. **revisao-ia** (só em PR, depois de `qualidade`): a IA revisa os testes e sugere outros; o resultado aparece no resumo do job e no artefato `ai-review`.
   Requer o secret `ANTHROPIC_API_KEY` (Settings > Secrets and variables > Actions). Sem ele, o job passa avisando que foi ignorado, o que também vale para PRs de fork.

Para bloquear o merge quando a CI falhar: Settings > Branches > regra para `main` > *Require status checks to pass* e marcar `qualidade` e `terraform`.

## Demonstrando acertos e erros

- **Acertos e erros nos testes:** `test/converter.test.js` tem as suítes "acertos" (conversões corretas) e "erros" (entradas inválidas que devem lançar `TypeError`/`RangeError`).
- **A suíte falhando:** troque `* 9) / 5` por `* 9) / 4` em `web/converter.js` e rode `npm test`: vários testes ficam vermelhos e a CI reprova o PR. Volte a alteração depois.
- **O linter falhando:** declare uma variável não usada em qualquer arquivo e rode `npm run lint`.
- **Falha real encontrada pela revisão de IA:** ver `docs/REVISAO_IA.md`.

## Terraform

Introdução a IaC sem nuvem: `terraform/main.tf` usa o provider `local` para "publicar" a tela, copiando os arquivos de `web/` para `terraform/publicado/`.

```bash
cd terraform
terraform init
terraform apply      # cria terraform/publicado/ com os 3 arquivos
terraform destroy    # remove tudo
```

Não precisa de conta nem de credenciais. Se você editar algo em `web/` e rodar `terraform apply` de novo, ele atualiza só o que mudou.
