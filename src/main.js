import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

import { initState, subscribe } from './state.js';  // убрали getPostsWithReadStatus
import { renderRSSForm, renderFeeds, renderPosts, showFeedback } from './view.js';
import { startUpdater } from './updater.js';
import { addRSSFeed } from './api.js';
import ru from './locales.js';

async function init() {
  initState();
  
  const rssFormContainer = document.getElementById('rssFormContainer');
  if (rssFormContainer) {
    renderRSSForm(rssFormContainer);
    
    const form = document.getElementById('rssForm');
    const urlInput = document.getElementById('rssUrl');
    
    if (form && urlInput) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        if (url) {
          const submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          
          await addRSSFeed(url);
          urlInput.value = '';
          
          submitBtn.disabled = false;
          urlInput.focus();
        } else {
          showFeedback(ru.notEmpty, true);
        }
      });
    }
  }
  
  subscribe('feeds', renderFeeds);
  subscribe('posts', () => {
    renderPosts();
  });
  
  startUpdater(5000);
  
  renderFeeds([]);
  renderPosts();
}

init();