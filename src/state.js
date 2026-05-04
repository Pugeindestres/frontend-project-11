// src/state.js
import { proxy } from 'valtio';

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
      feedTitle: post.feedTitle || state.feeds.find(f => f.id === feedId)?.title || '',
    }));
  
  if (postsToAdd.length > 0) {
    // Добавляем новые посты в конец массива (сохраняем порядок)
    state.posts.push(...postsToAdd);
  }
};

// Отметка поста как прочитанного
export const markAsRead = (postId) => {
  if (!state.readPosts.has(postId)) {
    state.readPosts.add(postId);
  }
};

// Проверка, прочитан ли пост
export const isRead = (postId) => state.readPosts.has(postId);

// Получение постов с флагом прочтения
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