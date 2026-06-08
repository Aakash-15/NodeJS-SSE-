const http = require('http');
const fs = require('fs');
const path = require('path');

let users = [
  { id: 1, name: 'Vishal', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Sriram', role: 'User', status: 'Pending' },
  { id: 3, name: 'Omar', role: 'User', status: 'Active' },
  { id: 4, name: 'Varun', role: 'Moderator', status: 'Active' },
  { id: 5, name: 'Satya', role: 'User', status: 'Pending' },
  { id: 6, name: 'Aakash', role: 'User', status: 'Active' }
];

let clients = [];

const server = http.createServer((req, res) => {
  const url = req.url;
  const method = req.method;


  if (method === 'GET' && (url === '/' || url === '/index.html')) {
    const filePath = path.join(__dirname, 'Frontend', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  }


  else if (method === 'GET' && url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }


  else if (method === 'GET' && url === '/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    clients.push(res);

    req.on('close', () => {
      clients = clients.filter(client => client !== res);
    });
  }

  else if (method === 'PUT' && url.startsWith('/api/data/')) {
    const id = parseInt(url.split('/').pop(), 10);

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        const index = users.findIndex(u => u.id === id);

        if (index !== -1) {
          users[index] = { ...users[index], ...updateData, id };

          clients.forEach(client => {
            client.write(`event: user_updated\n`);
            client.write(`data: ${JSON.stringify(users[index])}\n\n`);
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users[index]));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'User not found' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
