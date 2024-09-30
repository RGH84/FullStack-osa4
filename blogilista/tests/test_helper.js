const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTestToken = async () => {
  const user = await User.findOne({ username: 'root' })
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  return jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' })
}

const initialBlogs = [
  {
    title: 'Test',
    author: 'JK',
    url: 'www',
    likes: 0
  },
  {
    title: 'Test2',
    author: 'JK',
    url: 'www',
    likes: 0
  },
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb, usersInDb, getTestToken
}