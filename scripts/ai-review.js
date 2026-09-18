// Envia o código e os testes para o Claude revisar e sugerir testes diferentes.
// Uso: ANTHROPIC_API_KEY=... npm run ai-review   (sem a chave, o script só avisa e sai com 0)
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const chave = process.env.ANTHROPIC_API_KEY;
if (!chave) {
  console.log('ANTHROPIC_API_KEY ausente (ex.: PR de fork): revisão por IA ignorada.');
  process.exit(0);
}

const [codigo, testes] = await Promise.all([
  readFile('web/converter.js', 'utf8'),
  readFile('test/converter.test.js', 'utf8'),
]);

const prompt = `Você é um revisor de testes experiente. Abaixo estão uma função de conversão Celsius/Fahrenheit e sua suíte de testes (Jest).

1. Avalie a qualidade dos testes atuais (o que está bem coberto, o que é redundante).
2. Aponte lacunas: casos de borda, tipos de entrada, precisão de ponto flutuante.
3. Sugira testes DIFERENTES dos existentes, com código Jest pronto para colar.
Responda em português, em Markdown, de forma objetiva.

## web/converter.js
\`\`\`js
${codigo}
\`\`\`

## test/converter.test.js
\`\`\`js
${testes}
\`\`\``;

const resp = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'x-api-key': chave, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-5',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  }),
});

if (!resp.ok) {
  console.error(`Falha na API (${resp.status}): ${await resp.text()}`);
  process.exit(1);
}

const revisao = (await resp.json()).content.map((b) => b.text ?? '').join('');
await writeFile('ai-review.md', revisao);
console.log(revisao);

// No GitHub Actions, mostra a revisão na aba de resumo do job.
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `## Revisão dos testes por IA\n\n${revisao}\n`);
}
