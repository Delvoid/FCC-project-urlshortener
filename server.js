require('dotenv').config()
const express = require('express')
const cors = require('cors')
const validUrl = require('valid-url')

const app = express()

// Basic Configuration
const port = process.env.PORT || 3000
app.use(express.urlencoded())

const urlList = [
  {
    original_url: 'https://www.google.com',
    short_url: 1,
  },
  {
    original_url: 'https://www.test.com',
    short_url: 2,
  },
]

app.use(cors())
app.use('/public', express.static(`${process.cwd()}/public`))

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

app.get('/api/shorturl/', function (req, res) {
  res.json(urlList)
})

app.get('/api/shorturl/:id', function (req, res) {
  const { id } = req.params
  if (isNaN(id)) return res.json({ error: 'Invalid short url' })
  const shortUrl = urlList.filter((url) => {
    if (url.short_url === Number(id)) {
      return url
    }
  })
  if (shortUrl.length < 1) return res.json({ error: 'Url not found' })
  res.status(201).redirect(shortUrl[0].original_url)
})

const findUrl = (link) => {
  return urlList.filter((url) => {
    if (url.original_url === link) {
      return url
    }
  })
}
app.post('/api/shorturl/', async (req, res) => {
  const url = req.body.url
  try {
    const isValid = await validUrl.isWebUri(url)
    if (!isValid) return res.status(404).json({ error: 'Invalid url' })
    console.log(isValid)
    const exists = findUrl(url)
    if (exists.length > 0) return res.status(200).json(exists)
    const newShort = {
      original_url: url,
      short_url: urlList.length + 1,
    }
    urlList.push(newShort)
    res.status(200).json(newShort)
  } catch (error) {
    console.log(error)
    res.status(404).json({ error: 'Invalid error' })
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
