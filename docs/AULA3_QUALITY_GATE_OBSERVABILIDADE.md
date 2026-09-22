# Atividade 2 (Aula 3) — Quality Gate + Observabilidade com IA

## O que foi feito

- `quality-gate-ia`: job novo no `ci.yml`, roda em todo push/PR junto com o resto da CI. Pega a cobertura real do Jest e manda pra IA (Groq, `openai/gpt-oss-20b`) decidir se aprova ou bloqueia.
- `log-analysis.yml`, `metrics-analysis.yml`, `trace-analysis.yml`: workflows separados, disparados manualmente (aba Actions → escolher o workflow → Run workflow), que analisam `logs/app.log`, `metrics/system.json` e `traces/conversion_trace.txt` e abrem uma issue automática quando a IA acha algo crítico.

## Resultados

Já rodei tudo pelo menos uma vez pra garantir que funcionava antes de entregar. Resumo de cada run (link de cada um abaixo, só falta printar):

| Pipeline | Resultado | Run |
|---|---|---|
| Quality Gate (aprovado, cobertura 100%) | `APROVADO: Cobertura de testes acima do limite mínimo.` | [run 35671649014](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35671649014/job/106569299102) |
| Quality Gate (bloqueado, cobertura 76,92%) | `BLOQUEADO: cobertura abaixo de 90%.` | [run 35672609840](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35672609840/job/106572265918) |
| Análise de logs | achou o `CRITICAL`, abriu a [issue #4](https://github.com/pschlbeatriz/conversor-temperatura/issues/4) | [run 35675799084](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35675799084) |
| Análise de métricas | achou risco operacional (latência 3200ms, erro 22%), abriu a [issue #3](https://github.com/pschlbeatriz/conversor-temperatura/issues/3) | [run 35675800685](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35675800685) |
| Análise de traces | achou o gargalo na renderização (4800ms), abriu a [issue #2](https://github.com/pschlbeatriz/conversor-temperatura/issues/2) | [run 35675663588](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35675663588) |

Bug que apareci no caminho, também vale registrar: `log-analysis` e `metrics-analysis` falharam na primeira tentativa com `invalid character '\n' in string literal` — exatamente o aviso que tem no material da aula sobre montar o JSON concatenando string manualmente quando o conteúdo tem quebra de linha. Troquei pra montar o corpo da requisição com `jq` em vez de concatenar string na mão, e passou a funcionar.

## Como gerar os prints pro PDF

1. Abrir cada link da tabela acima, expandir o step da IA (`AI Quality Gate` / `IA analisa logs` / `IA analisa métricas` / `IA analisa traces`) e printar.
2. Aba **Issues** do repositório: printar a lista com as 3 issues abertas automaticamente, e cada uma individualmente.

## Respostas — item 3.6

**1. O que aconteceu quando o pipeline rodou? A IA bloqueou ou aprovou?**

Na primeira rodada, com a cobertura em 100%, a IA aprovou: *"APROVADO: Cobertura de testes acima do limite mínimo."* (run [35671649014](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35671649014)).

Antes disso, na primeira tentativa, o job nem rodou direito: o modelo que eu tinha copiado do material da aula (`llama-3.1-8b-instant`) já tinha sido descontinuado pela Groq em agosto/2026, a API retornou `model_not_found`. Troquei pelo modelo atual recomendado pela própria documentação da Groq (`openai/gpt-oss-20b`) e voltou a funcionar.

**2. Desafio: reduzir a cobertura de propósito e ver se a decisão muda.**

Comentei os testes de erro e de conversão Fahrenheit->Celsius pra derrubar a cobertura de 100% pra 76,92%. Nessa primeira tentativa de quebrar a cobertura eu só tirei os testes de erro (`erros: entradas inválidas`), e a cobertura caiu só até 92,3% de statements (o branch caiu pra 87,5%, mas o meu prompt só olhava statements) — a IA aprovou mesmo assim, porque continuava acima de 90% no número que eu mandava pra ela. Isso já foi um achado interessante: o gate do Jest (que olha várias métricas) bloqueou, mas o gate da IA (que só olha uma) aprovou — dois critérios diferentes, duas decisões diferentes pro mesmo commit.

Depois de comentar mais testes (Fahrenheit->Celsius inteiro também), a cobertura caiu pra 76,92% e aí sim a IA bloqueou: *"BLOQUEADO: cobertura abaixo de 90%."* (run [35672609840](https://github.com/pschlbeatriz/conversor-temperatura/actions/runs/35672609840)). Revertido os testes logo em seguida.

**3. Debate: "Podemos confiar 100% na decisão de uma IA para bloquear um deploy em produção?"**

Não, e o próprio teste da pergunta 2 mostrou por quê. Na tentativa em que a cobertura caiu pra 92,3% de statements (mas 87,5% de branch), o Jest bloqueou e a IA aprovou, porque eu só mandei pra ela um número (statements) e o meu prompt só checava esse. Ou seja, duas ferramentas analisando a mesma mudança de código chegaram em decisões opostas, dependendo de qual métrica cada uma olha. Isso mostra que a decisão da IA vale o que o prompt pede pra ela olhar, nada além disso — ela não "entende" qualidade de código, só segue a regra que eu escrevi.

Fora isso, cobertura alta não quer dizer que os testes são bons, só que as linhas rodaram. Dá pra ter 100% de cobertura com testes fracos que não checam nada de verdade. E o modelo também pode alucinar uma justificativa que não bate com o número enviado, e no pipeline ninguém revisa isso antes do deploy acontecer. Faz mais sentido usar a IA como uma camada extra de alerta, não como o único critério pra produção — rodando junto com regras fixas (tipo o `coverageThreshold` que o Jest já aplica) e, pelo menos pra decisões de produção, ainda ter alguém revisando antes do merge final.
