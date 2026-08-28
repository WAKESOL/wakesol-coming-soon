require('dotenv').config();

const http = require('http');

const PORT = 3001;
const BREVO_LIST_ID = 7;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const server = http.createServer(async (req, res) => {
  // Allow your website to communicate with this server
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Only accept POST requests to /api/join
  if (req.method !== 'POST' || req.url !== '/api/join') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, message: 'Not found' }));
    return;
  }

  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const { email } = JSON.parse(body);

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          ok: false,
          message: 'Please enter a valid email address.'
        }));
        return;
      }

      if (!BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY is not configured.');
      }

      const brevoResponse = await fetch(
        'https://api.brevo.com/v3/contacts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY,
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email,
            listIds: [BREVO_LIST_ID],
            updateEnabled: true
          })
        }
      );

      const brevoData = await brevoResponse.json().catch(() => ({}));

      if (!brevoResponse.ok) {
        console.error('Brevo error:', brevoData);

        res.writeHead(brevoResponse.status, {
          'Content-Type': 'application/json'
        });

        res.end(JSON.stringify({
          ok: false,
          message: 'We could not add you to the list. Please try again.'
        }));

        return;
      }

      res.writeHead(200, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        ok: true,
        message: "You're on the list!"
      }));

    } catch (error) {
      console.error('Server error:', error);

      res.writeHead(500, {
        'Content-Type': 'application/json'
      });

      res.end(JSON.stringify({
        ok: false,
        message: 'Something went wrong. Please try again.'
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`WAKESOL Brevo server running at http://localhost:${PORT}`);
});