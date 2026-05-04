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

const getFeedbackElement = () => {
  return document.querySelector('.feedback');
};

const getInputElement = () => {
  return document.querySelector('#rssUrl');
};

const getSubmitButton = () => {
  return document.querySelector('#submitBtn');
};

export const initForm = (container) => {
  if (!container) return null;
  
  container.innerHTML = `
    <form id="rssForm">
      <div class="mb-3">
        <label for="rssUrl" class="form-label">${headings.rssLabel}</label>
        <div class="input-group">
          <input 
            type="text" 
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
            ${headings.addButton}
          </button>
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
  if (btn) {
    btn.disabled = isLoading;
  }
};

export const setSuccess = (messageKey) => {
  console.log('=== setSuccess called, messageKey:', messageKey);
  
  const feedback = document.getElementById('rssFeedback');
  console.log('Feedback element:', feedback);
  
  if (feedback) {
    const message = 'RSS успешно загружен';
    feedback.textContent = message;
    feedback.classList.remove('text-danger');
    feedback.classList.add('text-success');
    feedback.style.display = 'block';
    feedback.style.visibility = 'visible';
    feedback.style.opacity = '1';
    
    console.log('Message set, textContent:', feedback.textContent);
    
    setTimeout(() => {
      if (feedback && feedback.textContent === message) {
        feedback.textContent = '';
        feedback.classList.remove('text-success');
        feedback.style.display = '';
        console.log('Message cleared after 5 seconds');
      }
    }, 5000);
  }
};

export const setError = (message) => {
  const input = getInputElement();
  const feedback = document.getElementById('rssFeedback');
  
  console.log('=== setError called, message:', message);
  
  if (input) {
    input.classList.add('is-invalid');
  }
  if (feedback) {
    feedback.textContent = message;
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    feedback.style.display = 'block';
    console.log('Error message set to:', feedback.textContent);
    
    setTimeout(() => {
      if (feedback && feedback.textContent === message) {
        feedback.textContent = '';
        feedback.classList.remove('text-danger');
        feedback.style.display = '';
        console.log('Error message cleared after 5 seconds');
      }
    }, 5000);
  }
};

export const clearError = () => {
  const input = getInputElement();
  const feedback = document.getElementById('rssFeedback');
  
  if (input) {
    input.classList.remove('is-invalid');
  }
  if (feedback && feedback.textContent !== 'RSS успешно загружен') {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
  }
};

export const resetForm = () => {
  const input = getInputElement();
  if (input) {
    input.value = '';
    input.focus();
  }
};

export const renderFeeds = (container, feeds) => {
  console.log('=== renderFeeds called ===');
  console.log('Container:', container);
  console.log('Feeds count:', feeds?.length);
  console.log('Feeds:', feeds);
  
  if (!container) return;
  
  if (!feeds || feeds.length === 0) {
    console.log('No feeds to display');
    container.innerHTML = `
      <div class="feeds">
        <div class="card">
          <div class="card-body">
            <h3>${headings.feedsTitle}</h3>
            <p class="text-muted">Нет добавленных RSS</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  console.log('Rendering', feeds.length, 'feeds');
  
  container.innerHTML = `
    <div class="feeds">
      <div class="card">
        <div class="card-body">
          <h3>${headings.feedsTitle}</h3>
          <ul class="list-group">
            ${feeds.map(feed => `
              <li class="list-group-item">
                <strong>${escapeHtml(feed.title || 'Без названия')}</strong>
                ${feed.description ? `<br><small class="text-muted">${escapeHtml(feed.description)}</small>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
  
  console.log('Feeds rendered successfully');
};

export const renderPosts = (container, posts, onPreviewClick) => {
  console.log('=== renderPosts called ===');
  console.log('Container:', container);
  console.log('Posts count:', posts?.length);
  console.log('First post:', posts?.[0]);
  
  if (!container) return;
  
  if (!posts || posts.length === 0) {
    console.log('No posts to display');
    container.innerHTML = `
      <div class="posts">
        <div class="card">
          <div class="card-body">
            <h3>${headings.postsTitle}</h3>
            <p class="text-muted">Нет постов</p>
          </div>
        </div>
      </div>
    `;
    return;
  }
  
  console.log('Rendering', posts.length, 'posts');
  
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.pubDate) - new Date(a.pubDate)
  );
  
  container.innerHTML = `
    <div class="posts">
      <div class="card">
        <div class="card-body">
          <h3>${headings.postsTitle}</h3>
          ${sortedPosts.map(post => `
            <div class="post-item mb-3 p-3 border rounded" data-post-id="${post.id}">
              <div class="d-flex justify-content-between align-items-start">
                <h4 class="post-title">
                  <a href="${post.link || '#'}" target="_blank" class="${post.isRead ? 'link-secondary' : 'fw-bold'}">
                    ${escapeHtml(post.title || 'Без названия')}
                  </a>
                </h4>
                <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="${post.id}">
                  ${headings.previewButton}
                </button>
              </div>
              <div class="post-meta text-muted small mt-2">
                <span class="feed-title">${escapeHtml(post.feedTitle || '')}</span>
                <span class="post-date ms-2">${formatDate(post.pubDate)}</span>
              </div>
              <p class="mt-2">${escapeHtml(post.description?.substring(0, 200) || 'Нет описания')}...</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  
  console.log('Posts rendered successfully');
  
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
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

