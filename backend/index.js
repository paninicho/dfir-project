const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const data = JSON.parse(fs.readFileSync('./data.json'));

app.get('/api/paths', (req, res) => {
  res.json(data.paths.map(p => ({ id: p.id, title: p.title })));
});

app.get('/api/paths/:id', (req, res) => {
  const path = data.paths.find(p => p.id === req.params.id);
  if (!path) return res.status(404).send('Path not found');
  res.json(path);
});

app.get('/api/modules/:id', (req, res) => {
  const mod = data.paths.flatMap(p => p.modules).find(m => m.id === req.params.id);
  if (!mod) return res.status(404).send('Module not found');
  res.json(mod);
});

app.post('/api/tasks/:id/check', (req, res) => {
  const { answer } = req.body;
  const task = data.paths.flatMap(p => p.modules).flatMap(m => m.tasks).find(t => t.id === req.params.id);
  if (!task) return res.status(404).send('Task not found');
  if (task.type !== 'quiz') return res.status(400).send('Not a quiz');
  const correct = (answer || '').toLowerCase().trim() === task.answer.toLowerCase().trim();
  res.json({ correct });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
