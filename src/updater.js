// src/updater.js
import { loadRSS } from './api.js';
import state, { addPosts, getPostsWithReadStatus } from './state.js';
import { renderPosts } from './view.js';

let updateTimeout = null;
let isUpdating = false;

// Функция для получения даты последнего поста в фиде
const getLastPostDate = (feedId) => {
  const feedPosts = state.posts.filter(post => post.feedId === feedId);
  if (feedPosts.length === 0) return null;
  
  const latestPost = feedPosts.reduce((latest, post) => {
    return new Date(post.pubDate) > new Date(latest.pubDate) ? post : latest;
  }, feedPosts[0]);
  
  return new Date(latestPost.pubDate);
};

// Функция для проверки одного фида на наличие новых постов
const checkFeedForUpdates = (feed) => {
  const lastPostDate = getLastPostDate(feed.id);
  
  return loadRSS(feed.url)
    .then(({ posts }) => {
      // Фильтруем только новые посты (которых ещё нет в состоянии)
      const existingPostLinks = new Set(state.posts.map(p => p.link));
      
      let newPosts = posts.filter(post => !existingPostLinks.has(post.link));
      
      // Если есть дата последнего поста, фильтруем по дате
      if (lastPostDate) {
        newPosts = newPosts.filter(post => new Date(post.pubDate) > lastPostDate);
      }
      
      if (newPosts.length > 0) {
        // Добавляем новые посты в состояние
        addPosts(feed.id, newPosts);
        console.log(`Добавлено ${newPosts.length} новых постов из "${feed.title}"`);
        
        // Обновляем UI
        const postsContainer = document.getElementById('postsContainer');
        if (postsContainer) {
          const postsWithStatus = getPostsWithReadStatus();
          renderPosts(postsContainer, postsWithStatus, null);
        }
      }
      
      return newPosts.length;
    })
    .catch((error) => {
      console.error(`Ошибка при обновлении фида "${feed.url}":`, error);
      return 0;
    });
};

// Функция для проверки всех фидов
const updateAllFeeds = () => {
  const feedsToCheck = [...state.feeds];
  
  if (feedsToCheck.length === 0) {
    return Promise.resolve();
  }
  
  const promises = feedsToCheck.map(feed => checkFeedForUpdates(feed));
  return Promise.all(promises)
    .then(results => {
      const totalNewPosts = results.reduce((sum, count) => sum + count, 0);
      if (totalNewPosts > 0) {
        console.log(`Всего добавлено ${totalNewPosts} новых постов`);
      }
    })
    .catch(error => {
      console.error('Ошибка при обновлении фидов:', error);
    });
};

// Рекурсивная функция для периодической проверки
const scheduleUpdate = (intervalMs = 5000) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  const tick = () => {
    if (isUpdating) {
      updateTimeout = setTimeout(tick, intervalMs);
      return;
    }
    
    isUpdating = true;
    
    updateAllFeeds()
      .finally(() => {
        isUpdating = false;
        updateTimeout = setTimeout(tick, intervalMs);
      });
  };
  
  updateTimeout = setTimeout(tick, intervalMs);
};

// Запуск обновлений
export const startUpdater = (intervalMs = 5000) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    isUpdating = false;
  }
  scheduleUpdate(intervalMs);
};

// Остановка обновлений
export const stopUpdater = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
    isUpdating = false;
  }
};