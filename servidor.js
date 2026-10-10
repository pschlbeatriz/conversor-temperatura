import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const PORTA = process.env.PORT || 3000;
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
let contador = 0;

async function simularLentidao() {
  if (process.env.SIMULAR_LENTIDAO === '1') {
    contador++;
    await new Promise((r) => setTimeout(r, 40 + 3 * contador));
  }
}

createServer(async (req, res) => {
  const rota = req.url.split('?')[0];
  if (rota === '/saude') return res.end('ok');
  await simularLentidao();
  const arquivo = normalize(join('web', rota === '/' ? 'index.html' : rota));
  if (!arquivo.startsWith('web')) return res.writeHead(403).end();
  try {
    res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] || 'text/plain' });
    res.end(await readFile(arquivo));
  } catch {
    res.writeHead(404).end('não encontrado');
  }
}).listen(PORTA);
