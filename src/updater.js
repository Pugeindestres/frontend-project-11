import { getFeeds, addPosts, getPosts } from './state.js';
import { loadPosts } from './api.js';

let isUpdating = false;
let updateTimeout = null;

function getLastPostDate(feedId) {
  const posts = getPosts();
  const feedPosts = posts.filter(post => post.feedId === feedId);
  
  if (feedPosts.length === 0) return null;
  
  const latest = Math.max(...feedPosts.map(p => new Date(p.pubDate).getTime()));
  return new Date(latest);
}

export function startUpdater(intervalMs = 5000) {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }
  
  async function tick() {
    if (isUpdating) return;
    
    isUpdating = true;
    
    try {
      const feeds = getFeeds();
      
      for (const feed of feeds) {
        const newPosts = await loadPosts(feed.url, {
          skipExisting: true,
          lastPostDate: getLastPostDate(feed.id),
        });
        
        if (newPosts && newPosts.length > 0) {
          addPosts(feed.id, newPosts);
          console.log(`Добавлено ${newPosts.length} новых постов из ${feed.title}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
    } finally {
      isUpdating = false;
      updateTimeout = setTimeout(tick, intervalMs);
    }
  }
  
  tick();
}

export function stopUpdater() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
  isUpdating = false;
}

export async function forceUpdate() {
  if (isUpdating) {
    console.log('Обновление уже выполняется...');
    return;
  }
  
  isUpdating = true;
  
  try {
    const feeds = getFeeds();
    let totalNewPosts = 0;
    
    for (const feed of feeds) {
      const newPosts = await loadPosts(feed.url, {
        skipExisting: true,
        lastPostDate: getLastPostDate(feed.id),
      });
      
      if (newPosts && newPosts.length > 0) {
        addPosts(feed.id, newPosts);
        totalNewPosts += newPosts.length;
      }
    }
    
    if (totalNewPosts > 0) {
      console.log(`Обновление завершено: ${totalNewPosts} новых постов`);
    } else {
      console.log('Новых постов нет');
    }
  } catch (error) {
    console.error('Ошибка при принудительном обновлении:', error);
  } finally {
    isUpdating = false;
  }
}