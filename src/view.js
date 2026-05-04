import ru from './locales.js';
import { getPostsWithReadStatus, markAsRead } from './state.js';

function createModalElement() {
  const modalHTML = `
    <div class="modal fade" id="postModal" tabindex="-1" aria-labelledby="postModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="postModalLabel">Заголовок поста</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="${ru.closeButton}"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${ru.closeButton}</button>
            <a href="#" class="btn btn-primary full-article-link" target="_blank">${ru.readFullButton}</a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  return document.getElementById('postModal');
}

function openPostModal(post) {
  let modal = document.getElementById('postModal');
  if (!modal) {
    modal = createModalElement();
  }
  
  const modalTitle = modal.querySelector('.modal-title');
  const modalBody = modal.querySelector('.modal-body');
  const fullLink = modal.querySelector('.full-article-link');
  const closeBtn = modal.querySelector('.btn-close');
  const secondaryBtn = modal.querySelector('.btn-secondary');
  
  modalTitle.textContent = post.title;
  modalBody.innerHTML = `<p>${escapeHtml(post.description || ru.modalGoal)}</p>`;
  fullLink.href = post.link;
  
  const closeModal = () => {
    const bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    } else {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  };
  
  closeBtn.onclick = closeModal;
  secondaryBtn.onclick = closeModal;
  
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}

export function renderRSSForm(container) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="card">
      <div class="card-body">
        <form id="rssForm">
          <div class="mb-3">
            <label for="rssUrl" class="form-label">${ru.rssLabel}</label>
            <div class="input-group">
              <input 
                type="url" 
                class="form-control" 
                id="rssUrl" 
                name="url"
                aria-label="url"
                autocomplete="off"
                placeholder="https://example.com/rss">
              <button 
                type="submit" 
                class="btn btn-primary">
                ${ru.addButton}
              </button>
            </div>
            <div class="feedback form-text"></div>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderFeeds(feeds) {
  const container = document.getElementById('feedsContainer');
  if (!container) return;
  
  if (!feeds || feeds.length === 0) {
    container.innerHTML = `
      <div class="feeds">
        <div class="card">
          <div class="card-body">
            <h3>${ru.feedsTitle}</h3>
            <p class="text-muted">Нет добавленных RSS</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="feeds">
      <div class="card">
        <div class="card-body">
          <h3>${ru.feedsTitle}</h3>
          <ul class="list-group">
            ${feeds.map(feed => `
              <li class="list-group-item">
                <strong>${escapeHtml(feed.title)}</strong><br>
                <small class="text-muted">${escapeHtml(feed.url)}</small>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
}

export function renderPosts() {
  const container = document.getElementById('postsContainer');
  if (!container) return;
  
  const postsWithStatus = getPostsWithReadStatus();
  const sorted = [...postsWithStatus].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="posts">
        <div class="card">
          <div class="card-body">
            <h3>${ru.postsTitle}</h3>
            <p class="text-muted">Нет постов</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="posts">
      <div class="card">
        <div class="card-body">
          <h3>${ru.postsTitle}</h3>
          ${sorted.map(post => `
            <div class="post-item mb-3 p-3 border rounded" data-post-id="${post.id}">
              <div class="d-flex justify-content-between align-items-start">
                <h4 class="post-title">
                  <a href="${post.link}" target="_blank" class="${post.isRead ? 'fw-normal' : 'fw-bold'}">
                    ${escapeHtml(post.title)}
                  </a>
                </h4>
                <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">
                  ${ru.previewButton}
                </button>
              </div>
              <div class="post-meta text-muted small mt-2">
                <span class="feed-title">${escapeHtml(post.feedTitle || '')}</span>
                <span class="post-date ms-2">${formatDate(post.pubDate)}</span>
              </div>
              <p class="mt-2">${escapeHtml(post.description?.substring(0, 200) || '')}...</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = btn.dataset.postId;
      const post = postsWithStatus.find(p => p.id === postId);
      if (post) {
        openPostModal(post);
        if (!post.isRead) {
          markAsRead(postId);
          const titleLink = btn.closest('.post-item').querySelector('.post-title a');
          if (titleLink) {
            titleLink.classList.remove('fw-bold');
            titleLink.classList.add('fw-normal');
          }
        }
      }
    });
  });
}

export function showFeedback(message, isError = false) {
  const feedbackDiv = document.querySelector('.feedback');
  if (feedbackDiv) {
    feedbackDiv.textContent = message;
    feedbackDiv.className = `feedback form-text ${isError ? 'text-danger' : 'text-success'}`;
    
    setTimeout(() => {
      if (feedbackDiv.textContent === message) {
        feedbackDiv.textContent = '';
      }
    }, 5000);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}