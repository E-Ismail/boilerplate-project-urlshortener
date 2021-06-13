require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const { response } = require('express');
const DB_URI = process.env.MONGO_URI;

mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
  .then(() => {
    console.log('Connection to MongoDB established!')
  });

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


/* Create URL Model */
let urlSchema = new mongoose.Schema({
  original: { type: String, required: true },
  short: { type: Number }
})

let Url = mongoose.model('URL', urlSchema)
let responseObject = {};

app.post('/api/shorturl', express.urlencoded(), function (req, res) {
  let original_url = req.body.url;
  console.log(original_url)
  let inputUrl = req.body.url
  responseObject['original_url'] = inputUrl
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)

  if (!inputUrl.match(urlRegex)) {
    response.json({ error: 'invalid URL' })
    return
  }

  responseObject['original_url'] = inputUrl

  let inputShort = 1

  Url.findOne({})
    .sort({ short: 'desc' })
    .exec((error, result) => {
      if (!error && result != undefined) {
        inputShort = result.short + 1
      } else {
        console.log(error);
      }
      if (!error) {
        console.log(result)
        Url.findOneAndUpdate(
          { original: inputUrl },
          {
            original: inputUrl,
            short: inputShort
          },
          { new: true, upsert: true },
          (error, savedUrl) => {
            if (!error) {
              responseObject['short_url'] = savedUrl.short
              res.json(responseObject)
            } else {
              console.log(error);
            }
          }
        )
      } else {
        console.log(error);
      }
    })
});



// dns.lookup(original_url, function (err, addresses, family) {
//   console.log('& ' + addresses + 'Family' + family);

//   if (err) {
//     res.json({ error: 'invalid url' });
//   } else {
//     resObject['original_url'] = original_url;
//     resObject['short_url'] = short_url;
//     res.json(resObject);
//   }
// });


app.get('/api/shorturl/:url_id', function (req, res) {
  let urlID = req.params.url_id;
  Url.findOne({ short: urlID }, (error, result) => {
    if (!error && result != undefined) {
      res.redirect(result.original);
    } else {
      res.json({ error: 'invalid url' });
    }
  });
});


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
