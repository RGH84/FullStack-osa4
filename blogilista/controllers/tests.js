const testingRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

testingRouter.post('/reset', async (request, response) => {
  console.log('Tests router reached: reset route2')
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter