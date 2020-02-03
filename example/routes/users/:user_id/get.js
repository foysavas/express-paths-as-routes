module.exports = async function(req, res) {
  res.json({ ok: true, user: { id: req.params.user_id } });
};
