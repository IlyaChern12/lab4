const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  const url = req.url;

  // возвращаем логин
  if (url === '/login') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ilyachern');
    return;
  }

  // извлекаем число из URL
  const idMatch = url.match(/^\/id\/(\d+)$/);
  if (idMatch) {
    const n = idMatch[1];

    // параметры запроса к внешнему API.
    // Content-Type отсутствует
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
      // собираем части в строку
      proxyRes.on('data', (chunk) => { data += chunk; });
      proxyRes.on('end', () => {
        try {
          const json = JSON.parse(data);
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(String(json.login)); // возвращаем только поле login
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Parse error');
        }
      });
    });

    // обработка ошибки
    proxyReq.on('error', (e) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Upstream error: ' + e.message);
    });

    proxyReq.end(); // отправляем запрос
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
