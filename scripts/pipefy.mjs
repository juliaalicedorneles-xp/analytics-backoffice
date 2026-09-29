// Busca os cards do Pipefy e grava dados.json no formato que o painel lê.
// Roda no GitHub Actions.
// Autenticação (Conta de Serviço do Pipefy): segredos PIPEFY_CLIENT_ID, PIPEFY_CLIENT_SECRET e PIPEFY_TOKEN_URL.
// Alternativa antiga: segredo PIPEFY_TOKEN com um token pronto.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const PIPE = process.env.PIPE_ID || '306826478';
// "sim" (padrão): mostra só o número do card, sem o título (títulos podem ter nome de cliente).
const OCULTAR_TITULO = (process.env.OCULTAR_TITULO || 'sim').toLowerCase() !== 'nao';
const ARQ = 'dados.json';

async function pegarToken() {
  if (process.env.PIPEFY_TOKEN) return process.env.PIPEFY_TOKEN.trim();
  const id = process.env.PIPEFY_CLIENT_ID?.trim(), segredo = process.env.PIPEFY_CLIENT_SECRET?.trim();
  const url = process.env.PIPEFY_TOKEN_URL?.trim() || 'https://app.pipefy.com/oauth/token';
  if (!id || !segredo) {
    console.log('Ainda não há chave do Pipefy cadastrada no GitHub. Nada a fazer por enquanto (o painel usa a planilha publicada).');
    process.exit(0);
  }
  const tentativas = [
    { 'Content-Type': 'application/json', body: JSON.stringify({ grant_type: 'client_credentials', client_id: id, client_secret: segredo }) },
    { 'Content-Type': 'application/x-www-form-urlencoded', body: new URLSearchParams({ grant_type: 'client_credentials', client_id: id, client_secret: segredo }).toString() }
  ];
  let ultimo = '';
  for (const t of tentativas) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': t['Content-Type'], Accept: 'application/json' }, body: t.body });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.access_token) return j.access_token;
    ultimo = `${r.status} ${JSON.stringify(j).slice(0, 300)}`;
  }
  console.error(`Não consegui gerar o token no Pipefy (${ultimo}). Confira o Client ID, o Client Secret e o endereço do token (PIPEFY_TOKEN_URL).`);
  process.exit(1);
}
const TOKEN = await pegarToken();

const QUERY = `query($pipe: ID!, $after: String) {
  allCards(pipeId: $pipe, first: 50, after: $after) {
    pageInfo { hasNextPage endCursor }
    edges { node {
      id title createdAt finished_at done
      current_phase { name }
      assignees { name }
      fields { name value }
      phases_history { phase { name } firstTimeIn lastTimeOut duration }
    } }
  }
}`;

async function pagina(after) {
  for (let tentativa = 1; ; tentativa++) {
    const r = await fetch('https://api.pipefy.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ query: QUERY, variables: { pipe: PIPE, after } })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && !j.errors && j.data?.allCards) return j.data.allCards;
    if (tentativa >= 3) throw new Error(`Pipefy respondeu ${r.status}: ${JSON.stringify(j.errors || j).slice(0, 400)}. Se for erro de permissão, adicione a conta de serviço como membro do pipe ${PIPE}.`);
    await new Promise(res => setTimeout(res, 3000 * tentativa));
  }
}

const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Descobre a que fase do painel cada fase do Pipefy corresponde, pelo nome.
function classificar(nome) {
  const n = norm(nome);
  if (n.includes('entreg') || n.includes('conclu') || n.includes('finaliz')) return { fim: true, tipo: n.includes('consolid') ? 'C' : n.includes('atualiz') ? 'A' : null };
  const tipo = n.includes('consolid') ? 'C' : n.includes('atualiz') || n.includes('portfolio') ? 'A' : null;
  if (!tipo) return null;
  return { k: (n.includes('andamento') ? 'a' : 'b') + tipo, tipo };
}

// O analista é o "Responsável" do card. Procura um campo com esse nome e,
// se não houver, usa os responsáveis (assignees) do próprio card.
function primeiro(v) {
  let s = v;
  if (typeof s === 'string' && s.trim().startsWith('[')) { try { const p = JSON.parse(s); if (Array.isArray(p)) s = p[0]; } catch {} }
  return String(s ?? '').split(/[;,\n]/)[0].trim();
}
function analistaDe(node) {
  const campos = node.fields || [];
  const resp = campos.find(f => norm(f.name).startsWith('responsav'));
  const doCampo = primeiro(resp?.value);
  if (doCampo) return doCampo;
  if (node.assignees?.length) return String(node.assignees[0].name).trim();
  const an = campos.find(f => norm(f.name).startsWith('analista'));
  return primeiro(an?.value) || 'Sem responsável';
}

function converter(node) {
  const f = {};
  let tipo = null, fimEm = null;
  for (const h of node.phases_history || []) {
    const c = classificar(h.phase?.name); if (!c) continue;
    if (c.tipo) tipo = tipo || c.tipo;
    if (c.fim) { fimEm = fimEm || h.firstTimeIn; continue; }
    const d = h.lastTimeOut && h.duration != null ? h.duration / 3600 : null;
    f[c.k] = { in: h.firstTimeIn, out: h.lastTimeOut || null, d };
  }
  const atual = classificar(node.current_phase?.name);
  tipo = atual?.tipo || tipo || 'A';
  const entregue = !!(node.done || node.finished_at || atual?.fim);
  const concl = entregue ? (node.finished_at || fimEm || Object.values(f).map(x => x.out).filter(Boolean).sort().pop() || null) : null;
  return {
    id: OCULTAR_TITULO ? `#${node.id}` : (node.title || `#${node.id}`),
    analista: analistaDe(node),
    fase: node.current_phase?.name || '',
    tipo,
    status: entregue ? 'entregue' : atual?.k?.startsWith('a') ? 'andamento' : 'backlog',
    criado: node.createdAt || null,
    concl,
    f
  };
}

const cards = [];
let after = null;
do {
  const p = await pagina(after);
  for (const e of p.edges) cards.push(converter(e.node));
  after = p.pageInfo.hasNextPage ? p.pageInfo.endCursor : null;
} while (after);

cards.sort((a, b) => String(a.criado).localeCompare(String(b.criado)));

// Só grava se algo mudou, para não criar commits à toa.
const anterior = existsSync(ARQ) ? JSON.parse(readFileSync(ARQ, 'utf8')) : null;
if (anterior && JSON.stringify(anterior.cards) === JSON.stringify(cards)) {
  console.log(`Nada mudou (${cards.length} cards).`);
} else {
  writeFileSync(ARQ, JSON.stringify({ atualizadoEm: new Date().toISOString(), pipe: PIPE, cards }));
  console.log(`dados.json atualizado com ${cards.length} cards.`);
}
