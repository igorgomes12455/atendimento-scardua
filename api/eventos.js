// Leitura protegida dos eventos, usada na atualização do painel
// GET /api/eventos?desde=0  com cabeçalho  Authorization: Bearer <LEITURA_TOKEN>
const { redis, LISTA } = require("./_redis");

module.exports = async (req, res) => {
  const chave = process.env.LEITURA_TOKEN;
  const enviado = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!chave || enviado !== chave) return res.status(401).json({ erro: "não autorizado" });
  const desde = Math.max(0, parseInt(req.query.desde, 10) || 0);
  try {
    const total = await redis(["LLEN", LISTA]);
    const itens = total > desde ? await redis(["LRANGE", LISTA, desde, -1]) : [];
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json({ total, desde, eventos: itens.map(x => JSON.parse(x)) });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};
