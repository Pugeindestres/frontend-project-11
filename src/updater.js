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