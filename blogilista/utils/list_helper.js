const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  const authorBlogCounts = {}

  blogs.forEach((blog) => {
    authorBlogCounts[blog.author] = (authorBlogCounts[blog.author] || 0) + 1
  })

  const mostProlificAuthor = Object.keys(authorBlogCounts).reduce((authorWithMaxBlogs, currentAuthor) => {
    return authorBlogCounts[authorWithMaxBlogs] > authorBlogCounts[currentAuthor]
      ? authorWithMaxBlogs
      : currentAuthor
  })

  return {
    author: mostProlificAuthor,
    blogs: authorBlogCounts[mostProlificAuthor]
  }
}

const mostLikes = (blogs) => {
  const authorLikeCounts = {}

  blogs.forEach((blog) => {
    authorLikeCounts[blog.author] = (authorLikeCounts[blog.author] || 0) + blog.likes
  })

  const mostLikedAuthor = Object.keys(authorLikeCounts).reduce((authorWithMaxLikes, currentAuthor) => {
    return authorLikeCounts[authorWithMaxLikes] > authorLikeCounts[currentAuthor]
      ? authorWithMaxLikes
      : currentAuthor
  })

  return {
    author: mostLikedAuthor,
    likes: authorLikeCounts[mostLikedAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}