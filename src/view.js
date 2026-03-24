import { subscribe } from 'valtio/vanilla'
import state from './state.js'
import { validateUrl } from './validator.js'
import { fetchRSS } from './api.js'

const getExistingUrls = () => state.feeds.map(feed => feed.url)

const addFeedToDOM = (feed) => {
  const feedsContainer = document.getElementById('feeds')
  
  const feedElement = document.createElement('div')
  feedElement.className = 'card mb-3'
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${escapeHtml(feed.title)}</h5>
      <p class="card-text text-muted">${escapeHtml(feed.description)}</p>
      <button class="btn btn-sm btn-outline-primary toggle-posts-btn">Показать посты</button>
      <div class="posts-list mt-3" style="display: none;">
        ${feed.items.map(item => `
          <div class="post-item mb-2 pb-2 border-bottom">
            <a href="${escapeHtml(item.link)}" target="_blank" class="text-decoration-none fw-bold">
              ${escapeHtml(item.title)}
            </a>
            <p class="small text-muted mt-1 mb-0">${escapeHtml(item.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
  
  const toggleButton = feedElement.querySelector('.toggle-posts-btn')
  const postsList = feedElement.querySelector('.posts-list')
  
  toggleButton.addEventListener('click', () => {
    const isHidden = postsList.style.display === 'none'
    postsList.style.display = isHidden ? 'block' : 'none'
    toggleButton.textContent = isHidden ? 'Скрыть посты' : 'Показать посты'
  })
  
  feedsContainer.prepend(feedElement)
}

const escapeHtml = (str) => {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

const clearForm = () => {
  const urlInput = document.getElementById('url-input')
  urlInput.value = ''
  urlInput.focus()
  state.form.url = ''
  state.form.isValid = true
  state.form.error = null
  state.form.isSubmitting = false
}

const updateFormUI = () => {
  const urlInput = document.getElementById('url-input')
  const submitButton = document.getElementById('submit-btn')
  const errorContainer = document.getElementById('error-message')
  
  if (state.form.isSubmitting) {
    submitButton.disabled = true
    urlInput.disabled = true
  } else {
    submitButton.disabled = false
    urlInput.disabled = false
  }
  
  if (!state.form.isValid && state.form.error) {
    urlInput.classList.add('is-invalid')
    if (errorContainer) {
      errorContainer.textContent = state.form.error
      errorContainer.style.display = 'block'
    }
  } else {
    urlInput.classList.remove('is-invalid')
    if (errorContainer) {
      errorContainer.textContent = ''
      errorContainer.style.display = 'none'
    }
  }
}

const handleSubmit = (event) => {
  event.preventDefault()
  
  const urlInput = document.getElementById('url-input')
  const url = urlInput.value.trim()
  
  if (!url) {
    state.form.isValid = false
    state.form.error = 'Не должно быть пустым'
    updateFormUI()
    return
  }
  
  state.form.isSubmitting = true
  state.form.isValid = true
  state.form.error = null
  updateFormUI()
  
  const existingUrls = getExistingUrls()
  
  validateUrl(url, existingUrls)
    .then(() => fetchRSS(url))
    .then(feed => {
      state.feeds.push(feed)
      addFeedToDOM(feed)
      clearForm()
      updateFormUI()
    })
    .catch(error => {
      state.form.isValid = false
      state.form.error = error.message
      state.form.isSubmitting = false
      updateFormUI()
    })
}

export const initView = () => {
  const form = document.getElementById('rss-form')
  const urlInput = document.getElementById('url-input')
  
  if (form) {
    form.addEventListener('submit', handleSubmit)
  }
  
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      state.form.isValid = true
      state.form.error = null
      updateFormUI()
    })
  }
  
  subscribe(state, () => {
    updateFormUI()
  })
  
  updateFormUI()
}
