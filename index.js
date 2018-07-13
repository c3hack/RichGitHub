const express = require('express')
const app = express()
const cors = require('cors')
const http = require('http')
const querystring = require('querystring')
const axios = require('axios');

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json({ limit: '500mb' }))
app.use(cors())

const caxy = (htmlOld, htmlNew) =>
  axios.post('http://php-htmldiff-api.caxy.com/diff/caxy_htmldiff', {
    htmlOld,
    htmlNew
  })
app.post('/', (req, res, next) => {
  const htmlNew = req.body.htmlNew
  const htmlOld = req.body.htmlOld
  const diffs = Promise.all(
    htmlOld
      .map((old, i) => caxy(old.content, htmlNew[i].content)
      .then(response => ({
        diff: response.data, path: old.path
      }))
    ))
    .then(diffs => res.send(diffs))
    .catch(next)
});
  
app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});
