import { readFileSync, writeFileSync } from 'node:fs';

const ARQUIVOS_PERMITIDOS = /^(web\/converter\.js|test\/[\w.-]+\.test\.js)$/;
const { ISSUE_TITLE, ISSUE_BODY, GROQCLOUD_API_KEY } = process.env;

const prompt = `Issue aberta no projeto conversor-temperatura:
Título: ${ISSUE_TITLE}
Descrição: ${ISSUE_BODY}

web/converter.js atual:
${readFileSync('web/converter.js', 'utf8')}

test/converter.test.js atual (use como modelo de estilo):
${readFileSync('test/converter.test.js', 'utf8')}

Resolva a issue alterando web/converter.js (ESM, mesmo estilo, sem comentários novos) e crie um arquivo de testes Jest em test/ cobrindo acertos e erros do que foi adicionado (cobertura mínima de 90%).
Responda SOMENTE neste formato, sem cercas de código:
=== RESUMO ===
o que mudou, em 2 frases
=== ARQUIVO: caminho/do/arquivo ===
conteúdo completo do arquivo
(repita o bloco ARQUIVO para cada arquivo)`;

const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQCLOUD_API_KEY}` },
  body: JSON.stringify({
    model: 'openai/gpt-oss-20b',
    reasoning_effort: 'low',
    max_completion_tokens: 8000,
    messages: [
      { role: 'system', content: 'Você é um desenvolvedor JavaScript sênior que corrige issues com mudanças mínimas.' },
      { role: 'user', content: prompt },
    ],
  }),
});
if (!resp.ok) throw new Error(`Groq ${resp.status}: ${await resp.text()}`);

const texto = (await resp.json()).choices[0].message.content;
const [cabecalho, ...blocos] = texto.split(/^=== ARQUIVO: (.+) ===$/m);
const resumo = cabecalho.replace('=== RESUMO ===', '').trim();
if (blocos.length === 0) throw new Error(`Resposta da IA sem blocos de arquivo:\n${texto}`);
for (let i = 0; i < blocos.length; i += 2) {
  const caminho = blocos[i].trim();
  const conteudo = `${blocos[i + 1].trim()}\n`;
  if (!ARQUIVOS_PERMITIDOS.test(caminho)) throw new Error(`IA tentou alterar arquivo fora da lista: ${caminho}`);
  writeFileSync(caminho, conteudo);
  console.log(`alterado: ${caminho}`);
}
writeFileSync('ia-resumo.txt', resumo);
