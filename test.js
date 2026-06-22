const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { app } = require('./app');

let server;
let baseUrl;

const request = (method, path, query = '') => {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `${path}${query}`,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
};

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /expressions returns seeded expressions', async () => {
  const res = await request('GET', '/expressions');

  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 3);
});

test('GET /animals returns seeded animals', async () => {
  const res = await request('GET', '/animals');

  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 3);
});

test('POST /expressions creates a new expression', async () => {
  const createRes = await request('POST', '/expressions', '?emoji=%F0%9F%A4%A9&name=starstruck');

  assert.equal(createRes.statusCode, 201);
  const created = JSON.parse(createRes.body);
  assert.equal(created.name, 'starstruck');
  assert.equal(created.emoji, '🤩');
  assert.equal(typeof created.id, 'number');

  const listRes = await request('GET', '/expressions');
  const expressions = JSON.parse(listRes.body);
  const found = expressions.find((item) => item.id === created.id);

  assert.ok(found);
});

test('DELETE /animals/:id removes an animal', async () => {
  const createRes = await request('POST', '/animals', '?emoji=%F0%9F%90%BC&name=Bear');
  assert.equal(createRes.statusCode, 201);

  const created = JSON.parse(createRes.body);
  const deleteRes = await request('DELETE', `/animals/${created.id}`);
  assert.equal(deleteRes.statusCode, 204);

  const getRes = await request('GET', `/animals/${created.id}`);
  assert.equal(getRes.statusCode, 404);
});
