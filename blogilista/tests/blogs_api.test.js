const bcrypt = require('bcrypt')
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', name: 'testuser', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'JuhoK',
      name: 'Juho Kemppainen',
      password: '1919',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

test('creation fails if password is too short', async () => {
  const newUser = {
    username: 'Testi',
    name: 'Testi',
    password: '11'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert(result.body.error.includes('Password must be at least 3 characters long'))
})

test('creation fails if username is too short', async () => {
  const newUser = {
    username: 'Te',
    name: 'Testi',
    password: '1111'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  assert(result.body.error.includes('is shorter than the minimum allowed length'))
})

describe('when there are initially some blogs saved', () => {

  let token

  beforeEach(async () => {

    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)

    token = await helper.getTestToken()
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })

  test('the first blog is about HTTP methods', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(e => e.title)
    assert(titles.includes('Test'))
  })

  test('returned blogs id is id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach(blog => {
      if (blog.id === undefined) {
        throw new Error('id should be defined')
      }

      if (blog._id !== undefined) {
        throw new Error('_id should be undefined')
      }
    })
  })

  describe('addition of a new blog', () => {

    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'async/await simplifies making async calls',
        author: 'JK',
        url: 'www',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const response = await api.get('/api/blogs')
      const title = response.body.map(r => r.title)
      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(title.includes('async/await simplifies making async calls'))
    })

    test('likes defaults to 0 if missing', async () => {
      const newBlog = {
        title: 'Likes',
        author: 'JK',
        url: 'www'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const addedBlog = response.body
      assert.strictEqual(addedBlog.likes, 0)
    })

    test('fails with status 400 if title is missing', async () => {
      const newBlog = {
        author: 'JK',
        url: 'www'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      assert.strictEqual(response.status, 400)
    })

    test('fails with status 400 if url is missing', async () => {
      const newBlog = {
        title: 'Likes',
        author: 'JK'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)

      assert.strictEqual(response.status, 400)
    })
  })
  describe('updating blog likes', () => {

    test('likes value is updated correctly', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedLikes = { likes: blogToUpdate.likes + 10 }

      const result = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedLikes)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(result.body.likes, blogToUpdate.likes + 10)
    })
  })
  describe('deletion of a blog', () => {
    let token

    beforeEach(async () => {
      await Blog.deleteMany({})

      token = await helper.getTestToken()

      const newBlog = {
        title: 'Blog to delete',
        author: 'JK',
        url: 'www',
        likes: 0
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
    })

    test('a blog can be deleted', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
