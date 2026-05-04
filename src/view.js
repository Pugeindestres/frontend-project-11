import i18next from 'i18next';

let currentForm = null;
let currentInput = null;
let currentSubmitBtn = null;

// Функция для получения элемента фидбека (всегда актуальный)
const getFeedbackElement = () => {
  return document.querySelector('.feedback');
};

// Функция для получения элемента инпута
const getInputElement = () => {
  return document.querySelector('#rssUrl');
};

// Функция для получения кнопки
const getSubmitButton = () => {
  return document.querySelector('#submitBtn');
};

export const initForm = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${i18next.t('rssLabel')}</label>
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
            class="btn btn-primary"
            id="submitBtn">
            ${i18next.t('addButton')}
          </button>
        </div>
        <div class="feedback"></div>
      </div>
    </form>
  `;
  
  currentForm = container.querySelector('#rssForm');
  currentInput = container.querySelector('#rssUrl');
  currentSubmitBtn = container.querySelector('#submitBtn');
  
  return { form: currentForm, input: currentInput };
};

export const setLoading = (isLoading) => {
  const btn = getSubmitButton();
  if (btn) {
    btn.disabled = isLoading;
  }
};

export const setSuccess = (messageKey) => {
  const feedback = getFeedbackElement();
  if (feedback) {
    feedback.textContent = i18next.t(messageKey);
    feedback.classList.add('text-success');
    feedback.classList.remove('text-danger');
    
    setTimeout(() => {
      const fb = getFeedbackElement();
      if (fb && fb.textContent === i18next.t(messageKey)) {
        fb.textContent = '';
        fb.classList.remove('text-success');
      }
    }, 5000);
  }
};

export const setError = (errorKey) => {
  const input = getInputElement();
  const feedback = getFeedbackElement();
  
  if (input) {
    input.classList.add('is-invalid');
  }
  if (feedback) {
    feedback.textContent = i18next.t(errorKey);
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
  }
};

export const clearError = () => {
  const input = getInputElement();
  const feedback = getFeedbackElement();
  
  if (input) {
    input.classList.remove('is-invalid');
  }
  if (feedback) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger', 'text-success');
  }
};

export const resetForm = () => {
  const input = getInputElement();
  if (input) {
    input.value = '';
    input.focus();
  }
  clearError();
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
                  <a href="${post.link}" target="_blank" class="${post.isRead ? 'link-secondary' : 'fw-bold'}">
                    ${escapeHtml(post.title)}
                  </a>
                </h4>
                <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">
                  ${i18next.t('previewButton')}
                </button>
              </div>
              <div class="post-meta text-muted small mt-2">
                <span class="feed-title">${escapeHtml(post.feedTitle || '')}</span>
              </div>
              <p class="mt-2">${escapeHtml(post.description?.substring(0, 200) || '')}...</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
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

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

