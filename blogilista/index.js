require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(morgan('tiny', {
  skip: (req) => req.method === 'POST'
}))


app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (req) => req.method !== 'POST'
}))


const unknownEndpoint = (request, response) => {
response.status(404).send({ error: 'unknown endpoint' })
}

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      console.log(blog)
      response.status(201).json(result)
    })
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})