const Blog = require('../models/blog')

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
  initialBlogs, nonExistingId, blogsInDb
}