import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

import { initState, subscribe, getPostsWithReadStatus } from './state.js';
import { renderRSSForm, renderFeeds, renderPosts, showFeedback } from './view.js';
import { startUpdater, forceUpdate } from './updater.js';
import { addRSSFeed } from './api.js';

async function init() {
  initState();
  
  const rssFormContainer = document.getElementById('rssFormContainer');
  if (rssFormContainer) {
    renderRSSForm(rssFormContainer);
    
    const addBtn = document.getElementById('addRssBtn');
    const urlInput = document.getElementById('rssUrl');
    
    if (addBtn && urlInput) {
      addBtn.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (url) {
          await addRSSFeed(url);
          urlInput.value = '';
        } else {
          showFeedback('Не должно быть пустым', true);
        }
      });
      
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          addBtn.click();
        }
      });
    }
  }
  
  subscribe('feeds', renderFeeds);
  subscribe('posts', () => {
    const posts = getPostsWithReadStatus();
    renderPosts(posts);
  });
  
  startUpdater(5000);
  
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      await forceUpdate();
      refreshBtn.disabled = false;
    });
  }
  
  // Начальная отрисовка
  renderFeeds([]);
  renderPosts([]);
}

init();