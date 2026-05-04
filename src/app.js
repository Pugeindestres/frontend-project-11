// src/app.js
import state, { 
  addFeed, 
  addPosts, 
  setLoading, 
  setError, 
  markAsRead, 
  getPostsWithReadStatus 
} from './state.js';
import { renderForm, renderFeeds, renderPosts, clearError, setError as setViewError } from './view.js';
import { loadRSS } from './api.js';
import { startUpdater, stopUpdater } from './updater.js';
import validate from './validate.js';
import i18next from 'i18next';

let formElements = null;
let rssFormContainer = null;
let modal = null;

// Функция для открытия модального окна
const openModal = (post) => {
  const modalElement = document.getElementById('postModal');
  if (!modalElement) return;
  
  const modalTitle = modalElement.querySelector('.modal-title');
  const modalBody = modalElement.querySelector('.modal-body');
  const fullLink = modalElement.querySelector('.full-article-link');
  
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalBody) modalBody.innerHTML = `<p>${escapeHtml(post.description || i18next.t('modalGoal'))}</p>`;
  if (fullLink) fullLink.href = post.link;
  
  // Отмечаем пост как прочитанный
  if (!state.readPosts.has(post.id)) {
    markAsRead(post.id);
    // Обновляем UI для изменения стиля ссылки
    updateUI();
  }
  
  // Показываем модальное окно
  if (modal) {
    modal.dispose();
  }
  modal = new bootstrap.Modal(modalElement);
  modal.show();
};

// Функция для обновления UI
const updateUI = () => {
  const feedsContainer = document.getElementById('feedsContainer');
  const postsContainer = document.getElementById('postsContainer');
  
  if (feedsContainer) {
    renderFeeds(feedsContainer, state.feeds);
  }
  if (postsContainer) {
    const postsWithStatus = getPostsWithReadStatus();
    renderPosts(postsContainer, postsWithStatus, openModal);
  }
};

// Функция добавления RSS
const addRSS = (url) => {
  const schema = validate(state.feeds);
  
  return schema.validate(url)
    .then(() => {
      setLoading(true);
      clearError(rssFormContainer);
      
      // Обновляем форму (блокируем кнопку)
      if (formElements) {
        const newElements = renderForm(rssFormContainer, true);
        if (newElements) formElements = newElements;
      }
      
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
      
      if (formElements && formElements.input) {
        formElements.input.value = '';
        formElements.input.focus();
      }
      
      setError(null);
      updateUI();
      
      return true;
    })
    .catch((err) => {
      let errorKey = 'networkError';
      
      if (err.message === 'noValidRSS') {
        errorKey = 'noValidRSS';
      } else if (err.name === 'ValidationError') {
        errorKey = err.message === 'alreadyExists' ? 'alreadyExists' : err.message;
      }
      
      setError(errorKey);
      setViewError(rssFormContainer, errorKey);
      
      if (formElements) {
        const newElements = renderForm(rssFormContainer, false, errorKey);
        if (newElements) {
          formElements = newElements;
          attachSubmitHandler();
        }
      }
      
      throw err;
    })
    .finally(() => {
      setLoading(false);
      if (formElements) {
        const newElements = renderForm(rssFormContainer, false);
        if (newElements) {
          formElements = newElements;
          attachSubmitHandler();
        }
      }
    });
};

// Обработчик отправки формы
let submitHandler = null;

const attachSubmitHandler = () => {
  if (formElements && formElements.form) {
    if (submitHandler) {
      formElements.form.removeEventListener('submit', submitHandler);
    }
    
    submitHandler = (e) => {
      e.preventDefault();
      const url = formElements.input.value.trim();
      if (url) {
        addRSS(url);
      } else {
        setViewError(rssFormContainer, 'notEmpty');
      }
    };
    
    formElements.form.addEventListener('submit', submitHandler);
  }
};

// Экранирование HTML
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
  rssFormContainer = document.getElementById('rssFormContainer');
  
  if (!rssFormContainer) return;
  
  // Отрисовка формы
  formElements = renderForm(rssFormContainer, false);
  attachSubmitHandler();
  
  // Начальный рендеринг
  updateUI();
  
  // Запускаем автоматическое обновление каждые 5 секунд
  startUpdater(5000);
  
  // Останавливаем обновления при выгрузке страницы
  window.addEventListener('beforeunload', () => {
    stopUpdater();
  });
};