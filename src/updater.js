import { loadRSS } from './api.js';
import state, { addPosts, getPostsWithReadStatus } from './state.js';
import { renderPosts } from './view.js';

let updateTimeout = null;
let isUpdating = false;

const getLastPostDate = (feedId) => {
  const feedPosts = state.posts.filter(post => post.feedId === feedId);
  if (feedPosts.length === 0) return null;
  
  const latestPost = feedPosts.reduce((latest, post) => {
    return new Date(post.pubDate) > new Date(latest.pubDate) ? post : latest;
  }, feedPosts[0]);
  
  return new Date(latestPost.pubDate);
};

const checkFeedForUpdates = (feed) => {
  const lastPostDate = getLastPostDate(feed.id);
  
  return loadRSS(feed.url)
    .then(({ posts }) => {
      const existingPostLinks = new Set(state.posts.map(p => p.link));
      
      let newPosts = posts.filter(post => !existingPostLinks.has(post.link));
      
      if (lastPostDate) {
        newPosts = newPosts.filter(post => new Date(post.pubDate) > lastPostDate);
      }
      
      if (newPosts.length > 0) {
        addPosts(feed.id, newPosts);
        
        const postsContainer = document.getElementById('postsContainer');
        if (postsContainer) {
          const postsWithStatus = getPostsWithReadStatus();
          renderPosts(postsContainer, postsWithStatus, null);
        }
      }
      
      return newPosts.length;
    })
    .catch(() => 0);
};

const updateAllFeeds = () => {
  const feedsToCheck = [...state.feeds];
  
  if (feedsToCheck.length === 0) {
    return Promise.resolve();
  }
  
  const promises = feedsToCheck.map(feed => checkFeedForUpdates(feed));
  return Promise.all(promises);
};

const scheduleUpdate = (intervalMs = 5000) => {
  if (updateTimeout) clearTimeout(updateTimeout);
  
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

export const startUpdater = (intervalMs = 5000) => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    isUpdating = false;
  }
  scheduleUpdate(intervalMs);
};

export const stopUpdater = () => {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
    isUpdating = false;
  }
};