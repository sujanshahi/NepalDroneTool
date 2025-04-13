import { createServer, request } from 'http';
import { log } from './vite';

// Create a simple HTTP proxy server that forwards requests to port 3000
const proxy = createServer((req, res) => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  // Create a request to our actual server on port 3000
  const proxyReq = request(options, (proxyRes: any) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  // Pipe the original request body to the proxied request
  req.pipe(proxyReq, { end: true });

  // Handle errors
  proxyReq.on('error', (err: Error) => {
    console.error('Proxy request error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: ' + err.message);
  });
});

// Listen on port 5000
const proxyPort = 5000;
proxy.listen(proxyPort, '0.0.0.0', () => {
  log(`Proxy server running on port ${proxyPort} -> forwarding to port 3000`);
  console.log(`Proxy server running on port ${proxyPort} -> forwarding to port 3000`);
});