const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const title = process.argv[3]
const author = process.argv[4]
const url = process.argv[5]

const TEST_MONGODB_URI =
  `mongodb+srv://jhmk:${password}@puhelin.6oit7.mongodb.net/testBloglist?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(TEST_MONGODB_URI)

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)

if (title && author && url) {
  const blog = new Blog({
    title: title,
    author: author,
    url: url,
    likes: 0
  })

  blog.save().then(() => {
    console.log(`Added ${title} to bloglist`)
    mongoose.connection.close()
  })
} else {
  Blog.find({}).then(result => {
    result.forEach(blog => {
      console.log(blog)
    })
    mongoose.connection.close()
  })
}