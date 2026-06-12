// @ts-check
async function handleHealth() {
  return { status: 200, body: { status: 'ok' } };
}
module.exports = { handleHealth };
