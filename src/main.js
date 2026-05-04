import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

import { initState, subscribe, getFeeds } from './state.js';
import { renderRSSForm, renderFeeds, renderPosts, showFeedback } from './view.js';
import { startUpdater } from './updater.js';
import { addRSSFeed } from './api.js';
import ru from './locales.js';

async function init() {
  // Инициализируем состояние
  initState();
  
  // Рендерим форму
  const rssFormContainer = document.getElementById('rssFormContainer');
  if (rssFormContainer) {
    renderRSSForm(rssFormContainer);
    
    const form = document.getElementById('rssForm');
    const urlInput = document.getElementById('rssUrl');
    
    if (form && urlInput) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput.value.trim();
        
        console.log('Form submitted with URL:', url); // Для отладки
        
        if (url) {
          const submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          
          const result = await addRSSFeed(url);
          console.log('addRSSFeed result:', result); // Для отладки
          
          if (result) {
            urlInput.value = '';
          }
          
          submitBtn.disabled = false;
          urlInput.focus();
        } else {
          showFeedback(ru.notEmpty, true);
        }
      });
    }
  }
  
  // Подписываемся на изменения
  subscribe('feeds', (feeds) => {
    console.log('Feeds updated:', feeds); // Для отладки
    renderFeeds(feeds);
  });
  
  subscribe('posts', () => {
    console.log('Posts updated'); // Для отладки
    renderPosts();
  });
  
  // Запускаем обновление
  startUpdater(5000);
  
  // Начальный рендеринг
  renderFeeds(getFeeds());
  renderPosts();
}

init();