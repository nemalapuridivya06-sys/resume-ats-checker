const http = require('http');

const data = JSON.stringify({
  resume: "Software Engineer with 5 years of experience.",
  jd: "Looking for a Software Engineer with Python skills."
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/tailor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${body}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
