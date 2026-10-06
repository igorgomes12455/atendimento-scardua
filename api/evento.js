// Recebe um passo da conversa do chatbot e guarda no fim da lista de eventos
const { redis, LISTA } = require("./_redis");

const TIPOS = ["abriu", "pergunta", "resp", "voltar", "reinicio", "resumo", "whats"];
const corta = (v, n) => String(v == null ? "" : v).slice(0, n);

function limpa(e) {
  if (!e || typeof e !== "object" || !TIPOS.includes(e.ev)) return null;
  const o = { t: new Date().toISOString(), sid: corta(e.sid, 40), ev: e.ev };
  if (e.q) o.q = corta(e.q, 120);
  if (e.v) o.v = corta(e.v, 200);
  if (e.cam) o.cam = corta(e.cam, 20);
  if (e.dest) o.dest = corta(e.dest, 30);
  if (e.origem) o.origem = corta(e.origem, 80);
  if (e.lead && typeof e.lead === "object") {
    o.lead = {};
    Object.keys(e.lead).slice(0, 12).forEach(k => { o.lead[corta(k, 40)] = corta(e.lead[k], 200); });
  }
  return o;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  let body = req.body;
  try { if (typeof body === "string") body = JSON.parse(body); } catch (_) { return res.status(400).end(); }
  const e = limpa(body);
  if (!e) return res.status(400).end();
  try {
    await redis(["RPUSH", LISTA, JSON.stringify(e)]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
