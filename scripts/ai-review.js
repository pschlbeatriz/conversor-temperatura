// Uso: GEMINI_API_KEY=... npm run ai-review   (sem a chave, o script só avisa e sai com 0)
import { readFile, writeFile, appendFile } from 'node:fs/promises';

const chave = process.env.GEMINI_API_KEY;
if (!chave) {
  console.log('GEMINI_API_KEY ausente (ex.: PR de fork): revisão por IA ignorada.');
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

const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent', {
  method: 'POST',
  headers: { 'x-goog-api-key': chave, 'content-type': 'application/json' },
  body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
});

if (!resp.ok) {
  console.error(`Falha na API (${resp.status}): ${await resp.text()}`);
  process.exit(1);
}

const revisao = (await resp.json()).candidates[0].content.parts.map((p) => p.text ?? '').join('');
await writeFile('ai-review.md', revisao);
console.log(revisao);

if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, `## Revisão dos testes por IA\n\n${revisao}\n`);
}
