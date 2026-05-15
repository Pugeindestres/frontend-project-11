import { setLoading, renderSuccess, renderError, renderFeeds, renderPosts, openModal } from './view.js'
import { addFeed, addPosts, markAsRead, getPostsWithReadStatus, getFeeds, watch } from './state.js'
import { loadRSS } from './api.js'
import validate from './validate.js'
import { startUpdater, stopUpdater } from './updater.js'

const updateUI = () => {
  renderFeeds(getFeeds())
  renderPosts(getPostsWithReadStatus(), (post) => {
    markAsRead(post.id)
    openModal(post)
  })
}

const addRSS = (url) => {
  const feeds = getFeeds()
  return validate(feeds).validate(url)
    .then(() => {
      setLoading(true)
      return loadRSS(url)
    })
    .then(({ feed, posts }) => {
      const feedId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
      addFeed({ id: feedId, url, title: feed.title, description: feed.description })
      addPosts(feedId, posts)
      renderSuccess()
      updateUI()
      return true
    })
    .catch((err) => {
      let key = 'networkError'
      if (err.message === 'noValidRSS') key = 'noValidRSS'
      else if (err.name === 'ValidationError') key = err.message
      renderError(key)
      throw err
    })
    .finally(() => {
      setLoading(false)
    })
}

const attachSubmitHandler = (form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const input = form.querySelector('#url-input')
    const url = input ? input.value.trim() : ''
    if (!url) {
      renderError('notEmpty')
      return
    }
    addRSS(url).catch(() => {})
  })
}

export default () => {
  const form = document.querySelector('.rss-form')
  if (form) attachSubmitHandler(form)

  watch(() => {
    const posts = getPostsWithReadStatus()
    renderPosts(posts, (post) => {
      markAsRead(post.id)
      openModal(post)
    })
  })

  updateUI()
  startUpdater(5000)
  window.addEventListener('beforeunload', stopUpdater)
}
