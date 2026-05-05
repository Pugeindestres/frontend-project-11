let currentForm = null;
let currentInput = null;
let currentSubmitBtn = null;

const headings = {
  feedsTitle: 'Фиды',
  postsTitle: 'Посты',
  rssLabel: 'Ссылка RSS',
  addButton: 'Добавить',
  previewButton: 'Просмотр',
  closeButton: 'Закрыть',
  readFullButton: 'Читать полностью',
  successLoad: 'RSS успешно загружен',
  alreadyExists: 'RSS уже существует',
  notEmpty: 'Не должно быть пустым',
  invalidUrl: 'Ссылка должна быть валидным URL',
  noValidRSS: 'Ресурс не содержит валидный RSS',
  networkError: 'Ошибка сети',
  modalGoal: 'Цель: Научиться извлекать из дерева необходимые данные'
};

const getInputElement = () => document.querySelector('#rssUrl');
const getSubmitButton = () => document.querySelector('#submitBtn');

export const initForm = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${headings.rssLabel}</label>
        <div class="input-group">
          <input type="text" class="form-control" id="rssUrl" name="url" aria-label="url" autocomplete="off" placeholder="https://example.com/rss">
          <button type="submit" class="btn btn-primary" id="submitBtn">${headings.addButton}</button>
        </div>
        <div id="rssFeedback" class="feedback form-text"></div>
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
  if (btn) btn.disabled = isLoading;
};

export const setSuccess = () => {
  const feedback = document.getElementById('rssFeedback');
  if (feedback) {
    feedback.textContent = headings.successLoad;
    feedback.classList.add('text-success');
    feedback.classList.remove('text-danger');
  }
};

export const setError = (errorKey) => {
  const input = getInputElement();
  const feedback = document.getElementById('rssFeedback');
  
  const messages = {
    notEmpty: headings.notEmpty,
    invalidUrl: headings.invalidUrl,
    alreadyExists: headings.alreadyExists,
    noValidRSS: headings.noValidRSS,
    networkError: headings.networkError
  };
  
  const message = messages[errorKey] || errorKey;
  
  if (input) input.classList.add('is-invalid');
  if (feedback) {
    feedback.textContent = message;
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
  }
};

export const clearError = () => {
  const input = getInputElement();
  const feedback = document.getElementById('rssFeedback');
  if (input) input.classList.remove('is-invalid');
  if (feedback) feedback.textContent = '';
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
    container.innerHTML = '<div class="feeds"><div class="card"><div class="card-body"><h3>Фиды</h3><p class="text-muted">Нет добавленных RSS</p></div></div></div>';
    return;
  }
  
  let html = '<div class="feeds"><div class="card"><div class="card-body"><h3>Фиды</h3><ul class="list-group">';
  feeds.forEach(feed => {
    html += `<li class="list-group-item"><strong>${escapeHtml(feed.title)}</strong>${feed.description ? `<br><small class="text-muted">${escapeHtml(feed.description)}</small>` : ''}</li>`;
  });
  html += '</ul></div></div></div>';
  container.innerHTML = html;
};

export const renderPosts = (container, posts, onPreviewClick) => {
  if (!container) return;
  
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div class="posts"><div class="card"><div class="card-body"><h3>Посты</h3><p class="text-muted">Нет постов</p></div></div></div>';
    return;
  }
  
  const sorted = [...posts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  let html = '<div class="posts"><div class="card"><div class="card-body"><h3>Посты</h3>';
  sorted.forEach(post => {
    html += `
      <div class="post-item mb-3 p-3 border rounded" data-post-id="${post.id}">
        <div class="d-flex justify-content-between align-items-start">
          <h4 class="post-title">
            <a href="${post.link || '#'}" target="_blank" class="${post.isRead ? 'link-secondary' : 'fw-bold'}">${escapeHtml(post.title)}</a>
          </h4>
          <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">${headings.previewButton}</button>
        </div>
        <div class="post-meta text-muted small mt-2">
          <span class="feed-title">${escapeHtml(post.feedTitle || '')}</span>
          <span class="post-date ms-2">${formatDate(post.pubDate)}</span>
        </div>
        <p class="mt-2">${escapeHtml(post.description?.substring(0, 200) || '')}...</p>
      </div>
    `;
  });
  html += '</div></div></div>';
  container.innerHTML = html;
  
  if (onPreviewClick) {
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const postId = btn.dataset.postId;
        const post = sorted.find(p => p.id === postId);
        if (post) onPreviewClick(post);
      });
    });
  }
};

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

