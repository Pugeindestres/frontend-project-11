import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles.css'
import state from './state.js'
import i18next, { initI18n } from './locales.js'
import * as yup from 'yup'

// Настройка сообщений yup на русском
yup.setLocale({
  mixed: {
    required: () => i18next.t('errors.required'),
    notType: () => i18next.t('errors.invalidUrl')
  },
  string: {
    url: () => i18next.t('errors.invalidUrl')
  }
})

// Создание схемы валидации
const createUrlSchema = () => {
  return yup.string()
    .required()
    .url()
}

// Генерация ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 6)

// Получить существующие URL
const getExistingUrls = () => state.feeds.map(feed => feed.url)

// Валидация URL
const validateUrl = (url, existingUrls) => {
  const schema = createUrlSchema()
  
  return schema.validate(url)
    .then(() => {
      if (existingUrls.includes(url)) {
        throw new Error(i18next.t('errors.duplicate'))
      }
      return true
    })
    .catch(error => {
      throw new Error(error.message)
    })
}

// Парсинг RSS
const parseRSS = (xmlText, url) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(i18next.t('errors.invalidRss'))
  }
  
  const feedTitle = doc.querySelector('channel > title')?.textContent || ''
  const feedDescription = doc.querySelector('channel > description')?.textContent || ''
  
  const items = Array.from(doc.querySelectorAll('item')).map(item => ({
    id: generateId(),
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || ''
  }))
  
  return {
    id: generateId(),
    title: feedTitle,
    description: feedDescription,
    url,
    items
  }
}

// Загрузка RSS
const fetchRSS = (url) => {
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&cache=false`
  
  return fetch(proxyUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(i18next.t('errors.networkError'))
      }
      return response.json()
    })
    .then(data => {
      if (!data.contents) {
        throw new Error(i18next.t('errors.emptyResponse'))
      }
      return parseRSS(data.contents, url)
    })
}

// Экранирование HTML
const escapeHtml = (str) => {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// Рендер фидов
const renderFeeds = () => {
  const feedsContainer = document.getElementById('feeds-container')
  if (!feedsContainer) return
  
  if (state.feeds.length === 0) {
    feedsContainer.innerHTML = `<p class="text-muted text-center">${i18next.t('noFeeds')}</p>`
    return
  }
  
  feedsContainer.innerHTML = state.feeds.map(feed => `
    <div class="card mb-3" data-feed-id="${feed.id}">
      <div class="card-body">
        <h5 class="card-title">${escapeHtml(feed.title)}</h5>
        <p class="card-text text-muted">${escapeHtml(feed.description)}</p>
      </div>
    </div>
  `).join('')
}

// Рендер постов
const renderPosts = () => {
  const postsContainer = document.getElementById('posts-container')
  if (!postsContainer) return
  
  if (state.posts.length === 0) {
    postsContainer.innerHTML = `<p class="text-muted text-center">${i18next.t('noPosts')}</p>`
    return
  }
  
  postsContainer.innerHTML = state.posts.map(post => `
    <div class="list-group-item list-group-item-action" data-post-id="${post.id}">
      <a href="${escapeHtml(post.link)}" target="_blank" class="text-decoration-none">
        <strong>${escapeHtml(post.title)}</strong>
      </a>
      <p class="small text-muted mt-1 mb-0">${escapeHtml(post.description)}</p>
    </div>
  `).join('')
}

// Обновление UI формы
const updateFormUI = () => {
  const urlInput = document.getElementById('url-input')
  const submitButton = document.getElementById('submit-btn')
  const errorContainer = document.getElementById('error-message')
  
  if (state.form.isSubmitting) {
    submitButton.disabled = true
    submitButton.textContent = i18next.t('loading')
    urlInput.disabled = true
  } else {
    submitButton.disabled = false
    submitButton.textContent = i18next.t('addButton')
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
    state.form.error = i18next.t('errors.required')
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
      // Добавляем фид
      state.feeds.push({
        id: feed.id,
        title: feed.title,
        description: feed.description,
        url: feed.url
      })
      
      // Добавляем посты
      const newPosts = feed.items.map(item => ({
        ...item,
        feedId: feed.id,
        feedTitle: feed.title
      }))
      state.posts.push(...newPosts)
      
      // Рендерим обновления
      renderFeeds()
      renderPosts()
      clearForm()
    })
    .catch(error => {
      state.form.isValid = false
      state.form.error = error.message
      state.form.isSubmitting = false
      updateFormUI()
    })
}

// Обновление интерфейса с переводами
const updateUIWithTranslations = () => {
  const appTitle = document.querySelector('h1')
  const appDescription = document.querySelector('.lead')
  const rssLabel = document.querySelector('label[for="url-input"]')
  const placeholder = document.getElementById('url-input')
  const submitButton = document.getElementById('submit-btn')
  const feedsTitle = document.getElementById('feeds-title')
  const postsTitle = document.getElementById('posts-title')
  
  if (appTitle) appTitle.textContent = i18next.t('appTitle')
  if (appDescription) appDescription.textContent = i18next.t('appDescription')
  if (rssLabel) rssLabel.textContent = i18next.t('rssLabel')
  if (placeholder) placeholder.placeholder = i18next.t('placeholder')
  if (submitButton && !state.form.isSubmitting) {
    submitButton.textContent = i18next.t('addButton')
  }
  if (feedsTitle) feedsTitle.textContent = i18next.t('feeds')
  if (postsTitle) postsTitle.textContent = i18next.t('posts')
  
  renderFeeds()
  renderPosts()
}

// Инициализация приложения
const init = () => {
  initI18n()
    .then(() => {
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
      
      updateUIWithTranslations()
      updateFormUI()
    })
    .catch(error => {
      console.error('Failed to initialize i18next:', error)
    })
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init)
