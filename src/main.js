import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles.css'
import { subscribe } from 'valtio/vanilla'
import * as yup from 'yup'

// Состояние приложения
const state = {
  feeds: [],
  form: {
    url: '',
    isValid: true,
    error: null,
    isSubmitting: false
  }
}

// Схема валидации URL
const urlSchema = yup.string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL')

// Получить существующие URL
const getExistingUrls = () => state.feeds.map(feed => feed.url)

// Валидация URL
const validateUrl = (url, existingUrls) => {
  return urlSchema.validate(url)
    .then(() => {
      if (existingUrls.includes(url)) {
        throw new Error('RSS уже существует')
      }
      return true
    })
    .catch(error => {
      throw new Error(error.message)
    })
}

// Парсинг RSS
const parseRSS = (xmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Invalid RSS feed')
  }
  
  const title = doc.querySelector('title')?.textContent || 'Без названия'
  const description = doc.querySelector('description')?.textContent || ''
  const items = Array.from(doc.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || ''
  }))
  
  return { title, description, items, url: '' }
}

// Загрузка RSS
const fetchRSS = (url) => {
  return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network error')
      }
      return response.json()
    })
    .then(data => {
      if (!data.contents) {
        throw new Error('Empty response')
      }
      const feed = parseRSS(data.contents)
      feed.url = url
      return feed
    })
}

// Добавление фида в DOM
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

// Экранирование HTML
const escapeHtml = (str) => {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Обновление UI формы
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

// Очистка формы
const clearForm = () => {
  const urlInput = document.getElementById('url-input')
  urlInput.value = ''
  urlInput.focus()
  state.form.url = ''
  state.form.isValid = true
  state.form.error = null
  state.form.isSubmitting = false
  updateFormUI()
}

// Обработчик отправки формы
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

// Инициализация приложения
const init = () => {
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
  
  updateFormUI()
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init)
