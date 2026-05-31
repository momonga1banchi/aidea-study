function getHealth(req, res) {
  res.json({
    ok: true,
    data: {
      status: 'ok',
      service: 'ai-coding-demo',
    },
  });
}

module.exports = { getHealth };
