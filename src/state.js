// src/state.js
import { proxy } from 'valtio/vanilla';  // ← важно: /vanilla, а не просто 'valtio'

const state = proxy({
  feeds: [],
  posts: [],
  readPosts: new Set(),
  loading: false,
  error: null,
});

// Вспомогательные функции для работы с состоянием
export const addFeed = (feed) => {
  const exists = state.feeds.some(f => f.url === feed.url);
  if (!exists) {
    state.feeds.push(feed);
  }
};

export const addPosts = (feedId, newPosts) => {
  const existingLinks = new Set(state.posts.map(p => p.link));
  const postsToAdd = newPosts
    .filter(post => !existingLinks.has(post.link))
    .map(post => ({
      ...post,
      id: `${feedId}_${Date.now()}_${Math.random()}`,
      feedId,
      feedTitle: post.feedTitle || '',
    }));
  
  if (postsToAdd.length > 0) {
    state.posts.push(...postsToAdd);
  }
};

export const markAsRead = (postId) => {
  if (!state.readPosts.has(postId)) {
    state.readPosts.add(postId);
  }
};

export const isRead = (postId) => state.readPosts.has(postId);

export const getPostsWithReadStatus = () => {
  return state.posts.map(post => ({
    ...post,
    isRead: state.readPosts.has(post.id),
  }));
};

export const setLoading = (value) => {
  state.loading = value;
};

export const setError = (error) => {
  state.error = error;
};

export default state;