require('dotenv').config();
const express = require('express');
const cors = require('cors');
var dns = require('dns');
var bodyParser = require('body-parser')
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies



app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let short_url = 2;
let original_url = '';


app.post('/api/shorturl', function (req, res) {
  original_url = req.body.url;
  if (original_url.startsWith('https')) {
    original_url= original_url.replace('https://','');
  }
  dns.lookup(original_url, function (err, addresses, family) {
    console.log('& ' + addresses + 'Family' + family)
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      res.json({ "original_url": original_url, "short_url": short_url });
    }
  });
});

app.get('/api/shorturl/:url_id', function (req, res) {
  if (req.params.url_id) res.redirect(original_url)
  else res.json({ error: 'invalid url' });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
