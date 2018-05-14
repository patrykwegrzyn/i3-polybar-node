const fastify = require('fastify')();
const i3 = require('./i3');

fastify.get('/', (req, res) => {
  let currentTabs = i3.getTabs();
  res.send(currentTabs !== '' ? ' ' + currentTabs : '');
});

fastify.get('/title', (req, res) => {
    res.send(i3.getTitle());
});

fastify.get('/cycle/:mode',  (req, res) => {
  console.log('cycle')
  i3.cycleWindows(req.params.mode)
  res.send();
});

fastify.listen('9007', (err) => {
  if (err) throw err;
  console.log(`server listening on ${fastify.server.address().port}`);
});
