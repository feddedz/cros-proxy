const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/cors', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send('Missing url query parameter');
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.origin;

    // If request has body and is not GET/HEAD, pass it through
    let body = undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    // Copy response status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    const data = await response.buffer();
    res.send(data);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('CORS proxy running on port', PORT));
