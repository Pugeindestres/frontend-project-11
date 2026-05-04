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
import i18next from 'i18next';

let formElements = null;
let modal = null;

const openModal = (post) => {
  console.log('openModal called for post:', post.title);
  const modalElement = document.getElementById('modal');
  if (!modalElement) return;
  
  const modalTitle = modalElement.querySelector('.modal-title');
  const modalBody = modalElement.querySelector('.modal-body');
  const fullLink = modalElement.querySelector('.full-article-link');
  
  if (modalTitle) modalTitle.textContent = post.title;
  if (modalBody) modalBody.innerHTML = `<p>${escapeHtml(post.description || i18next.t('modalGoal'))}</p>`;
  if (fullLink) fullLink.href = post.link;
  
  if (!state.readPosts.has(post.id)) {
    markAsRead(post.id);
    updateUI();
  }
  
  if (modal) modal.dispose();
  modal = new bootstrap.Modal(modalElement);
  modal.show();
  console.log('Modal opened');
};

const updateUI = () => {
  console.log('updateUI called');
  const feedsContainer = document.getElementById('feedsContainer');
  const postsContainer = document.getElementById('postsContainer');
  
  if (feedsContainer) renderFeeds(feedsContainer, state.feeds);
  if (postsContainer) {
    const postsWithStatus = getPostsWithReadStatus();
    renderPosts(postsContainer, postsWithStatus, openModal);
  }
};

const addRSS = (url) => {
  console.log('=== addRSS DEBUG ===');
  console.log('url:', url);
  
  const schema = validate(state.feeds);
  
  return schema.validate(url)
    .then(() => {
      console.log('Validation passed ✅');
      setLoading(true);
      setFormLoading(true);
      clearError();
      
      return loadRSS(url);
    })
    .then(({ feed, posts }) => {
      console.log('RSS loaded successfully ✅');
      console.log('feed:', feed);
      console.log('posts count:', posts.length);
      
      const newFeed = {
        id: Date.now().toString(),
        url,
        title: feed.title,
        description: feed.description,
        createdAt: new Date(),
      };
      
      console.log('Adding feed:', newFeed);
      addFeed(newFeed);
      
      console.log('Adding posts...');
      addPosts(newFeed.id, posts);
      
      console.log('Calling setSuccess...');
      setSuccess('successLoad');
      
      resetForm();
      setStateError(null);
      updateUI();
      
      console.log('addRSS completed successfully ✅');
      return true;
    })
    .catch((err) => {
      console.error('=== Error in addRSS ===');
      console.error('Error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      
      let errorKey = 'networkError';
      
      if (err.message === 'noValidRSS') {
        errorKey = 'noValidRSS';
        console.log('Setting error key: noValidRSS');
      } else if (err.name === 'ValidationError') {
        if (err.message === 'alreadyExists') {
          errorKey = 'alreadyExists';
          console.log('Setting error key: alreadyExists');
        } else if (err.type === 'required') {
          errorKey = 'notEmpty';
          console.log('Setting error key: notEmpty');
        } else if (err.type === 'url') {
          errorKey = 'invalidUrl';
          console.log('Setting error key: invalidUrl');
        } else {
          errorKey = err.message;
        }
      }
      
      setStateError(errorKey);
      setError(errorKey);
      
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
    console.log('Form submitted, url:', url);
    if (url) {
      addRSS(url);
    } else {
      console.log('Empty URL, showing error');
      setError('notEmpty');
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
  console.log('=== APP INITIALIZATION ===');
  const rssFormContainer = document.getElementById('rssFormContainer');
  console.log('rssFormContainer:', rssFormContainer);
  
  if (!rssFormContainer) return;
  
  formElements = initForm(rssFormContainer);
  console.log('formElements after initForm:', formElements);
  
  if (formElements && formElements.form) {
    attachSubmitHandler(formElements.form);
    console.log('Submit handler attached');
  }
  
  updateUI();
  startUpdater(5000);
  console.log('Updater started');
  
  window.addEventListener('beforeunload', () => stopUpdater());
  console.log('=== APP INITIALIZATION COMPLETE ===');
};