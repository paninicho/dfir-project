const http = require('http');
const assert = require('assert');
const server = require('./index');
function request(path, options={}) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 3001, path, method: options.method || 'GET', headers: { 'Content-Type': 'application/json' } }, res => {
      let data='';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    if(options.body) req.write(JSON.stringify(options.body));
    req.on('error', reject);
    req.end();
  });
}
(async () => {
  try {
    const res = await request('/api/paths');
    assert.strictEqual(res.status, 200);
    const paths = JSON.parse(res.body);
    assert(Array.isArray(paths) && paths.length >= 3);
    console.log('Tests passed');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    server.close();
    process.exit(1);
  }
})();
