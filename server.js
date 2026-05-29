const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ilyachern');
    return;
  }

  const idMatch = url.match(/^\/id\/(\d+)$/);
  if (idMatch) {
    const n = idMatch[1];
    const options = {
      hostname: 'nd.kodaktor.ru',
      path: `/users/${n}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => { data += chunk; });
      proxyRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(String(json.login));
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Parse error');
        }
      });
    });

    proxyReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Upstream error: ' + e.message);
    });

    proxyReq.end();
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
