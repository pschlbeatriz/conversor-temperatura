# Atividade 2 (Aula 3) — Quality Gate + Observabilidade com IA

## O que foi feito

- `quality-gate-ia`: job novo no `ci.yml`, roda em todo push/PR junto com o resto da CI. Pega a cobertura real do Jest e manda pra IA (Groq, `openai/gpt-oss-20b`) decidir se aprova ou bloqueia.
- `log-analysis.yml`, `metrics-analysis.yml`, `trace-analysis.yml`: workflows separados, disparados manualmente (aba Actions → escolher o workflow → Run workflow), que analisam `logs/app.log`, `metrics/system.json` e `traces/conversion_trace.txt` e abrem uma issue automática quando a IA acha algo crítico.

## Como gerar os prints pro PDF

1. Aba **Actions** do repositório, esperar o job `Quality Gate com IA` rodar no último push (aprovado, cobertura tá em 100%). Print do log do step "AI Quality Gate" e do resumo (Summary) do job.
2. Pra mostrar o **bloqueio**: derrubar a cobertura de propósito (comentar um teste em `test/converter.test.js`, por exemplo), dar commit e push, esperar rodar, printar o `BLOQUEADO` da IA e o job vermelho. Depois reverter o commit.
3. Rodar `log-analysis`, `metrics-analysis` e `trace-analysis` manualmente (Actions → workflow → Run workflow). Printar o log de cada um mostrando a decisão da IA, e a aba **Issues** do repositório mostrando as issues criadas automaticamente.

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
