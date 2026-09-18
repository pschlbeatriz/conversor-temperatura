# Revisão dos testes por IA

Revisão feita pelo Claude (Claude Code, modelo Sonnet 5) sobre `web/converter.js` e `test/converter.test.js`.
Na pipeline, o mesmo trabalho é feito automaticamente em todo PR por `scripts/ai-review.js` (job `revisao-ia`), que envia código e testes à API do Claude e publica o resultado no resumo do job.

## Avaliação da suíte original (20 testes, 100% de cobertura)

**Pontos fortes**
- Separa acertos (pontos notáveis da água, temperatura corporal, -40 igual nas duas escalas) de erros (tipos inválidos, abaixo do zero absoluto).
- Compara floats com tolerância em vez de `===`, evitando testes frágeis.
- Testa o limite exato do zero absoluto (aceito) e um passo abaixo (rejeitado).

**Fragilidades**
- Os 5 tipos inválidos repetem o mesmo padrão, mas isso é aceitável: o `for` mantém cada caso com nome próprio na saída.
- **100% de cobertura é enganoso:** a métrica só mede `converter.js`. `main.js` (a tela) não é carregado por nenhum teste e não aparece no relatório.
- Cobertura de linhas não garante que os *valores* foram verificados; ela não detectou as lacunas abaixo.

## Lacunas encontradas

| # | Lacuna | Verificado? | Resultado |
|---|--------|-------------|-----------|
| 1 | **Overflow:** `celsiusParaFahrenheit(Number.MAX_VALUE)` devolvia `Infinity` sem erro | Sim | **Bug real**, corrigido em `converter.js` (função `resultado`) |
| 2 | Tipos não testados: `boolean`, array, objeto, `bigint` | Sim | Já eram rejeitados; agora estão cobertos |
| 3 | Ida e volta (F→C→F) preserva o valor | Sim | Passa com tolerância de 1e-9 (o erro de float chega a ~1e-16) |
| 4 | Camada da tela (`main.js`): campo vazio, vírgula decimal, entradas como `0x10` (vira 16) e `1e3` (vira 1000) | Parcial | Não automatizado; ver sugestões |

## Testes sugeridos (implementados em `test/converter.sugeridos.test.js`)

- Propriedade de ida e volta para 8 valores (negativos, zero, frações, 1e6).
- Rejeição de `boolean`, array, objeto e `bigint` nas duas funções.
- Overflow com `Number.MAX_VALUE` nas duas direções, esperando `RangeError`.

Evidência do ciclo: antes da correção, a suíte tinha **34 testes, 32 passando e 2 falhando** (os de overflow). Depois da correção, **34 de 34 passam**.

## Sugestões ainda não implementadas

- Extrair o parse da entrada (`"36,6"` → `36.6`, `""` → erro, rejeitar `0x10`/`1e3` se não forem desejados) para uma função pura em arquivo próprio e testá-la; hoje essa lógica está em `main.js`, sem teste.
- Teste de interface com Playwright ou jsdom para o fluxo digitar valor → converter → ver resultado.
