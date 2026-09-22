# Atividade 2 (Aula 3) — Quality Gate + Observabilidade com IA

## O que foi feito

- `quality-gate-ia`: job novo no `ci.yml`, roda em todo push/PR junto com o resto da CI. Pega a cobertura real do Jest e manda pra IA (Groq, `llama-3.1-8b-instant`) decidir se aprova ou bloqueia.
- `log-analysis.yml`, `metrics-analysis.yml`, `trace-analysis.yml`: workflows separados, disparados manualmente (aba Actions → escolher o workflow → Run workflow), que analisam `logs/app.log`, `metrics/system.json` e `traces/conversion_trace.txt` e abrem uma issue automática quando a IA acha algo crítico.

## Como gerar os prints pro PDF

1. Aba **Actions** do repositório, esperar o job `Quality Gate com IA` rodar no último push (aprovado, cobertura tá em 100%). Print do log do step "AI Quality Gate" e do resumo (Summary) do job.
2. Pra mostrar o **bloqueio**: derrubar a cobertura de propósito (comentar um teste em `test/converter.test.js`, por exemplo), dar commit e push, esperar rodar, printar o `BLOQUEADO` da IA e o job vermelho. Depois reverter o commit.
3. Rodar `log-analysis`, `metrics-analysis` e `trace-analysis` manualmente (Actions → workflow → Run workflow). Printar o log de cada um mostrando a decisão da IA, e a aba **Issues** do repositório mostrando as issues criadas automaticamente.

## Respostas — item 3.6

**1. O que aconteceu quando o pipeline rodou? A IA bloqueou ou aprovou?**
_(preencher depois de rodar — colar aqui o texto que a IA respondeu)_

**2. Desafio: reduzir a cobertura de propósito e ver se a decisão muda.**
_(preencher depois de repetir o teste com cobertura baixa)_

**3. Debate: "Podemos confiar 100% na decisão de uma IA para bloquear um deploy em produção?"**

Não. A IA aqui só olha pra um número (a cobertura) e decide com base nisso, mas cobertura alta não quer dizer que os testes são bons, só que as linhas foram executadas. Dá pra ter 100% de cobertura com testes fracos que não checam nada de verdade. Além disso, o modelo pode interpretar errado o prompt ou simplesmente alucinar uma resposta que não bate com o número que foi enviado, e no pipeline ninguém revisa isso antes do deploy acontecer. Faz mais sentido usar a IA como uma camada a mais de alerta, não como o único critério que decide se o código vai pra produção — o ideal é ela rodar junto com regras fixas (tipo o coverageThreshold que o Jest já aplica) e, pelo menos pra decisões de produção, ainda ter alguém revisando antes do merge final.
