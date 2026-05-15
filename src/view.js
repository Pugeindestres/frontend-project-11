import i18next from 'i18next'
import { Modal } from 'bootstrap'

const getInput = () => document.querySelector('#url-input')
const getSubmitBtn = () => document.querySelector('button[type="submit"]')
const getFeedback = () => document.querySelector('.feedback')

export const initForm = () => {
  const input = getInput()
  const submitBtn = getSubmitBtn()
  const feedback = getFeedback()
  return { input, submitBtn, feedback }
}

export const setLoading = (isLoading) => {
  const btn = getSubmitBtn()
  if (btn) btn.disabled = isLoading
}

export const renderSuccess = () => {
  const input = getInput()
  const feedback = getFeedback()
  if (input) {
    input.classList.remove('is-invalid')
    input.value = ''
    input.focus()
  }
  if (feedback) {
    feedback.textContent = i18next.t('statusMessage.success')
    feedback.classList.remove('text-danger')
    feedback.classList.add('text-success')
  }
}

export const renderError = (errorKey) => {
  const input = getInput()
  const feedback = getFeedback()
  if (input) input.classList.add('is-invalid')
  if (feedback) {
    feedback.textContent = i18next.t(`statusMessage.${errorKey}`)
    feedback.classList.remove('text-success')
    feedback.classList.add('text-danger')
  }
}

export const renderFeeds = (feeds) => {
  const container = document.querySelector('.feeds')
  if (!container) return

  const card = container.querySelector('.card') || container
  card.innerHTML = `
    <div class="card-body">
      <h2 class="card-title h4">${i18next.t('titles.feeds')}</h2>
      <ul class="list-group border-0">
        ${feeds.map(feed => `
          <li class="list-group-item border-0 border-end-0">
            <h3 class="h6 m-0">${feed.title}</h3>
            <p class="m-0 small text-black-50">${feed.description}</p>
          </li>
        `).join('')}
      </ul>
    </div>
  `
}

export const renderPosts = (posts, onPreview) => {
  const container = document.querySelector('.posts')
  if (!container) return

  const card = container.querySelector('.card') || container
  card.innerHTML = `
    <div class="card-body">
      <h2 class="card-title h4">${i18next.t('titles.posts')}</h2>
      <ul class="list-group border-0 rounded-0">
        ${posts.map(post => `
          <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0">
            <a
              href="${post.link}"
              data-id="${post.id}"
              target="_blank"
              rel="noopener noreferrer"
              class="${post.isRead ? 'fw-normal link-secondary' : 'fw-bold'}"
            >${post.title}</a>
            <button
              type="button"
              data-id="${post.id}"
              data-bs-toggle="modal"
              data-bs-target="#modal"
              class="btn btn-outline-primary btn-sm"
            >${i18next.t('buttons.view')}</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `

  container.querySelectorAll('button[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const postId = btn.getAttribute('data-id')
      const post = posts.find(p => p.id === postId)
      if (post && onPreview) onPreview(post)
    })
  })
}

export const openModal = (post) => {
  const modalEl = document.getElementById('modal')
  if (!modalEl) return

  modalEl.querySelector('.modal-title').textContent = post.title
  modalEl.querySelector('.modal-body').textContent = post.description
  modalEl.querySelector('.full-article').href = post.link

  const modal = Modal.getOrCreateInstance(modalEl)
  modal.show()
}
