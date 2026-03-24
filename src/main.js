import 'bootstrap/dist/js/bootstrap.bundle.min.js'

const form = document.getElementById('rss-form')
const urlInput = document.getElementById('url-input')
const feedsContainer = document.getElementById('feeds')

const parseRSS = (xmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  
  const title = doc.querySelector('title')?.textContent || 'No title'
  const description = doc.querySelector('description')?.textContent || ''
  const items = Array.from(doc.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || ''
  }))
  
  return { title, description, items }
}

const fetchRSS = (url) => {
  return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then(data => {
      const rssData = parseRSS(data.contents)
      return rssData
    })
}

const addFeedToDOM = (feed) => {
  const feedElement = document.createElement('div')
  feedElement.className = 'card'
  feedElement.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${escapeHtml(feed.title)}</h5>
      <p class="card-text">${escapeHtml(feed.description)}</p>
      <button class="btn btn-sm btn-outline-primary toggle-posts">Show posts</button>
      <div class="posts-list mt-2" style="display: none;">
        ${feed.items.map(item => `
          <div class="post-item mb-2">
            <a href="${escapeHtml(item.link)}" target="_blank" class="text-decoration-none">
              <strong>${escapeHtml(item.title)}</strong>
            </a>
            <p class="small text-muted mt-1">${escapeHtml(item.description)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `
  
  const toggleButton = feedElement.querySelector('.toggle-posts')
  const postsList = feedElement.querySelector('.posts-list')
  
  toggleButton.addEventListener('click', () => {
    const isHidden = postsList.style.display === 'none'
    postsList.style.display = isHidden ? 'block' : 'none'
    toggleButton.textContent = isHidden ? 'Hide posts' : 'Show posts'
  })
  
  feedsContainer.prepend(feedElement)
}

const escapeHtml = (str) => {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const validateUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault()
  
  const url = urlInput.value.trim()
  
  if (!validateUrl(url)) {
    urlInput.classList.add('is-invalid')
    return
  }
  
  urlInput.classList.remove('is-invalid')
  urlInput.disabled = true
  
  fetchRSS(url)
    .then(feed => {
      addFeedToDOM(feed)
      urlInput.value = ''
      urlInput.disabled = false
    })
    .catch(error => {
      console.error('Error fetching RSS:', error)
      urlInput.classList.add('is-invalid')
      urlInput.disabled = false
    })
})