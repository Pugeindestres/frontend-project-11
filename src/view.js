// src/view.js
import i18next from 'i18next';

export const renderForm = (container, isLoading = false, errorKey = null) => {
  if (!container) return;
  
  const errorClass = errorKey ? 'is-invalid' : '';
  const errorMessage = errorKey ? i18next.t(errorKey) : '';
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${i18next.t('rssLabel')}</label>
        <div class="input-group">
          <input 
            type="url" 
            class="form-control ${errorClass}" 
            id="rssUrl" 
            name="url"
            aria-label="url"
            autocomplete="off"
            placeholder="https://example.com/rss">
          <button 
            type="submit" 
            class="btn btn-primary"
            ${isLoading ? 'disabled' : ''}>
            ${i18next.t('addButton')}
          </button>
        </div>
        <div id="rssFeedback" class="feedback ${errorKey ? 'text-danger' : ''}">
          ${errorMessage}
        </div>
      </div>
    </form>
  `;
  
  const form = container.querySelector('#rssForm');
  const input = container.querySelector('#rssUrl');
  
  return { form, input };
};

export const renderFeeds = (container, feeds) => {
  if (!container) return;
  
  if (!feeds || feeds.length === 0) {
    container.innerHTML = `
      <div class="feeds">
        <div class="card">
          <div class="card-body">
            <h3>${i18next.t('feedsTitle')}</h3>
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
          <h3>${i18next.t('feedsTitle')}</h3>
          <ul class="list-group">
            ${feeds.map(feed => `
              <li class="list-group-item">
                <strong>${escapeHtml(feed.title)}</strong>
                ${feed.description ? `<br><small class="text-muted">${escapeHtml(feed.description)}</small>` : ''}
                <br><small class="text-muted">${escapeHtml(feed.url)}</small>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
};

export const renderPosts = (container, posts, onPreviewClick) => {
  if (!container) return;
  
  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div class="posts">
        <div class="card">
          <div class="card-body">
            <h3>${i18next.t('postsTitle')}</h3>
            <p class="text-muted">Нет постов</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  // Сортируем посты по дате (новые сверху)
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.pubDate) - new Date(a.pubDate)
  );
  
  container.innerHTML = `
    <div class="posts">
      <div class="card">
        <div class="card-body">
          <h3>${i18next.t('postsTitle')}</h3>
          ${sortedPosts.map(post => `
            <div class="post-item mb-3 p-3 border rounded" data-post-id="${post.id}">
              <div class="d-flex justify-content-between align-items-start">
                <h4 class="post-title">
                  <a href="${post.link}" target="_blank" class="${post.isRead ? 'fw-normal' : 'fw-bold'}">
                    ${escapeHtml(post.title)}
                  </a>
                </h4>
                <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">
                  ${i18next.t('previewButton')}
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
  
  // Добавляем обработчики для кнопок предпросмотра
  if (onPreviewClick) {
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const postId = btn.dataset.postId;
        const post = posts.find(p => p.id === postId);
        if (post && onPreviewClick) {
          onPreviewClick(post);
        }
      });
    });
  }
};

export const clearError = (container) => {
  const feedback = container?.querySelector('#rssFeedback');
  const input = container?.querySelector('#rssUrl');
  
  if (feedback) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
  }
  if (input) {
    input.classList.remove('is-invalid');
  }
};

export const setError = (container, errorKey) => {
  const feedback = container?.querySelector('#rssFeedback');
  const input = container?.querySelector('#rssUrl');
  
  if (feedback) {
    feedback.textContent = i18next.t(errorKey);
    feedback.classList.add('text-danger');
  }
  if (input) {
    input.classList.add('is-invalid');
  }
};

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

