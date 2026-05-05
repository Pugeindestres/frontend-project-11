let formElements = null;

const MSG = {
  feedTitle: 'Фиды',
  postTitle: 'Посты',
  rssLabel: 'Ссылка RSS',
  addButton: 'Добавить',
  previewButton: 'Просмотр',
  closeButton: 'Закрыть',
  readFullButton: 'Читать полностью',
  success: 'RSS успешно загружен',
  alreadyExists: 'RSS уже существует',
  notEmpty: 'Не должно быть пустым',
  invalidUrl: 'Ссылка должна быть валидным URL',
  noValidRSS: 'Ресурс не содержит валидный RSS',
  networkError: 'Ошибка сети',
};

const getInput = () => document.querySelector('#rssUrl');
const getSubmitBtn = () => document.querySelector('#submitBtn');
const getFeedback = () => document.querySelector('#rssFeedback');

export const initForm = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${MSG.rssLabel}</label>
        <div class="input-group">
          <input type="text" class="form-control" id="rssUrl" name="url" aria-label="url" autocomplete="off" placeholder="https://example.com/rss">
          <button type="submit" class="btn btn-primary" id="submitBtn">${MSG.addButton}</button>
        </div>
        <div id="rssFeedback" class="feedback form-text"></div>
      </div>
    </form>
  `;
  
  formElements = { form: container.querySelector('#rssForm'), input: container.querySelector('#rssUrl') };
  return formElements;
};

export const setLoading = (isLoading) => {
  const btn = getSubmitBtn();
  if (btn) btn.disabled = isLoading;
};

export const setSuccess = () => {
  const fb = getFeedback();
  if (fb) {
    fb.textContent = MSG.success;
    fb.classList.add('text-success');
    fb.classList.remove('text-danger');
    setTimeout(() => { if (fb) fb.textContent = ''; }, 5000);
  }
};

export const setError = (key) => {
  const input = getInput();
  const fb = getFeedback();
  const messages = { notEmpty: MSG.notEmpty, invalidUrl: MSG.invalidUrl, alreadyExists: MSG.alreadyExists, noValidRSS: MSG.noValidRSS, networkError: MSG.networkError };
  const message = messages[key] || key;
  if (input) input.classList.add('is-invalid');
  if (fb) {
    fb.textContent = message;
    fb.classList.add('text-danger');
    fb.classList.remove('text-success');
    setTimeout(() => { if (fb && fb.textContent === message) fb.textContent = ''; }, 5000);
  }
};

export const clearError = () => {
  const input = getInput();
  const fb = getFeedback();
  if (input) input.classList.remove('is-invalid');
  if (fb && fb.textContent !== MSG.success) fb.textContent = '';
};

export const resetForm = () => {
  const input = getInput();
  if (input) { input.value = ''; input.focus(); }
  clearError();
};

export const renderFeeds = (container, feeds) => {
  if (!container) return;
  if (!feeds?.length) {
    container.innerHTML = `<div class="card"><div class="card-body"><h3>${MSG.feedTitle}</h3><p class="text-muted">Нет добавленных RSS</p></div></div>`;
    return;
  }
  let html = `<div class="card"><div class="card-body"><h3>${MSG.feedTitle}</h3><ul class="list-group">`;
  feeds.forEach(feed => { html += `<li class="list-group-item"><strong>${escapeHtml(feed.title)}</strong>${feed.description ? `<br><small class="text-muted">${escapeHtml(feed.description)}</small>` : ''}</li>`; });
  html += `</ul></div></div>`;
  container.innerHTML = html;
};

export const renderPosts = (container, posts, onPreviewClick) => {
  if (!container) return;
  if (!posts?.length) {
    container.innerHTML = `<div class="card"><div class="card-body"><h3>${MSG.postTitle}</h3><p class="text-muted">Нет постов</p></div></div>`;
    return;
  }
  const sorted = [...posts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  let html = `<div class="card"><div class="card-body"><h3>${MSG.postTitle}</h3>`;
  sorted.forEach(post => {
    html += `
      <div class="post-item mb-3 p-3 border rounded" data-post-id="${post.id}">
        <div class="d-flex justify-content-between align-items-start">
          <h4 class="post-title"><a href="${post.link || '#'}" target="_blank" class="${post.isRead ? 'link-secondary' : 'fw-bold'}">${escapeHtml(post.title)}</a></h4>
          <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">${MSG.previewButton}</button>
        </div>
        <div class="post-meta text-muted small mt-2"><span class="feed-title">${escapeHtml(post.feedTitle || '')}</span></div>
        <p class="mt-2">${escapeHtml(post.description?.substring(0, 200) || '')}...</p>
      </div>
    `;
  });
  html += `</div></div>`;
  container.innerHTML = html;
  if (onPreviewClick) {
    document.querySelectorAll('.preview-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const post = sorted.find(p => p.id === btn.dataset.postId);
        if (post) onPreviewClick(post);
      };
    });
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}