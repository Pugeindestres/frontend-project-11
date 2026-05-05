import state, { addFeed, addPosts, setLoading, markAsRead, getPostsWithReadStatus, getFeeds } from './state.js';
import { initForm, setLoading as setFormLoading, setSuccess, setError, clearError, resetForm, renderFeeds, renderPosts } from './view.js';
import { loadRSS } from './api.js';
import { startUpdater, stopUpdater } from './updater.js';
import validate from './validate.js';

let formElements = null;
let modal = null;

const openModal = (post) => {
  const el = document.getElementById('modal');
  if (!el) return;
  el.querySelector('.modal-title').textContent = post.title;
  el.querySelector('.modal-body').innerHTML = `<p>${escapeHtml(post.description || 'Цель: Научиться извлекать из дерева необходимые данные')}</p>`;
  el.querySelector('.full-article-link').href = post.link;
  if (!state.readPosts.has(post.id)) {
    markAsRead(post.id);
    updateUI();
  }
  if (modal) modal.dispose();
  modal = new bootstrap.Modal(el);
  modal.show();
};

const updateUI = () => {
  const feedsC = document.getElementById('feedsContainer');
  const postsC = document.getElementById('postsContainer');
  
  const feeds = getFeeds();
  const postsWithStatus = getPostsWithReadStatus();
  
  if (feedsC) renderFeeds(feedsC, feeds);
  if (postsC) renderPosts(postsC, postsWithStatus, openModal);
};

const addRSS = (url) => {
  return validate(getFeeds()).validate(url)
    .then(() => {
      setLoading(true);
      setFormLoading(true);
      clearError();
      return loadRSS(url);
    })
    .then(({ feed, posts }) => {
      addFeed({ id: Date.now().toString(), url, title: feed.title, description: feed.description, createdAt: new Date() });
      addPosts(Date.now().toString(), posts);
      setSuccess();
      updateUI();
      resetForm();
      return true;
    })
    .catch((err) => {
      let key = 'networkError';
      if (err.message === 'noValidRSS') key = 'noValidRSS';
      else if (err.name === 'ValidationError') {
        if (err.message === 'alreadyExists') key = 'alreadyExists';
        else if (err.type === 'required') key = 'notEmpty';
        else if (err.type === 'url') key = 'invalidUrl';
      }
      setError(key);
      throw err;
    })
    .finally(() => {
      setLoading(false);
      setFormLoading(false);
    });
};

const attachSubmitHandler = (form) => {
  form.onsubmit = (e) => {
    e.preventDefault();
    const url = formElements.input.value.trim();
    url ? addRSS(url) : setError('notEmpty');
  };
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

export default () => {
  const container = document.getElementById('rssFormContainer');
  if (!container) return;
  formElements = initForm(container);
  if (formElements?.form) attachSubmitHandler(formElements.form);
  updateUI();
  startUpdater(5000);
  window.addEventListener('beforeunload', () => stopUpdater());
};