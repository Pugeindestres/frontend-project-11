import state, { 
  addFeed, 
  addPosts, 
  setLoading, 
  setError as setStateError,
  markAsRead, 
  getPostsWithReadStatus 
} from './state.js';
import { 
  initForm, setLoading as setFormLoading, setSuccess, setError, clearError, resetForm,
  renderFeeds, renderPosts 
} from './view.js';
import { loadRSS } from './api.js';
import { startUpdater, stopUpdater } from './updater.js';
import validate from './validate.js';

let formElements = null;
let modal = null;

const openModal = (post) => {
  const modalElement = document.getElementById('modal');
  if (!modalElement) return;
  
  const modalTitle = modalElement.querySelector('.modal-title');
  const modalBody = modalElement.querySelector('.modal-body');
  const fullLink = modalElement.querySelector('.full-article-link');
  
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalBody) modalBody.innerHTML = `<p>${escapeHtml(post.description || 'Цель: Научиться извлекать из дерева необходимые данные')}</p>`;
  if (fullLink) fullLink.href = post.link;
  
  if (!state.readPosts.has(post.id)) {
    markAsRead(post.id);
    updateUI();
  }
  
  if (modal) modal.dispose();
  modal = new bootstrap.Modal(modalElement);
  modal.show();
};

const updateUI = () => {
  const feedsContainer = document.getElementById('feedsContainer');
  const postsContainer = document.getElementById('postsContainer');
  
  if (feedsContainer) renderFeeds(feedsContainer, state.feeds);
  if (postsContainer) {
    const postsWithStatus = getPostsWithReadStatus();
    renderPosts(postsContainer, postsWithStatus, openModal);
  }
};

const addRSS = (url) => {
  const schema = validate(state.feeds);
  
  return schema.validate(url)
    .then(() => {
      setLoading(true);
      setFormLoading(true);
      clearError();
      return loadRSS(url);
    })
    .then(({ feed, posts }) => {
      const newFeed = {
        id: Date.now().toString(),
        url,
        title: feed.title,
        description: feed.description,
        createdAt: new Date(),
      };
      
      addFeed(newFeed);
      addPosts(newFeed.id, posts);
      
      // Сначала показываем сообщение об успехе
      setSuccess('successLoad');
      
      // Затем обновляем интерфейс
      updateUI();
      
      // Очищаем форму, НО НЕ СТИРАЕМ СООБЩЕНИЕ
      if (formElements && formElements.input) {
        formElements.input.value = '';
        formElements.input.focus();
      }
      
      setStateError(null);
      return true;
    })
    .catch((err) => {
      let errorMessage;
      
      if (err.message === 'noValidRSS') {
        errorMessage = 'Ресурс не содержит валидный RSS';
      } else if (err.message === 'Network Error' || err.message === 'networkError') {
        errorMessage = 'Ошибка сети';
      } else if (err.name === 'ValidationError') {
        errorMessage = err.message;
      } else {
        errorMessage = 'Ошибка сети';
      }
      
      setStateError(errorMessage);
      setError(errorMessage);
      throw err;
    })
    .finally(() => {
      setLoading(false);
      setFormLoading(false);
    });
};

const attachSubmitHandler = (form) => {
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = formElements.input.value.trim();
    if (url) {
      addRSS(url);
    } else {
      setError('Не должно быть пустым');
    }
  });
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

export default () => {
  const rssFormContainer = document.getElementById('rssFormContainer');
  if (!rssFormContainer) return;
  
  formElements = initForm(rssFormContainer);
  if (formElements && formElements.form) {
    attachSubmitHandler(formElements.form);
  }
  
  updateUI();
  startUpdater(5000);
  
  window.addEventListener('beforeunload', () => stopUpdater());
};