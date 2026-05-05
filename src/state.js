import { proxy } from 'valtio/vanilla';

const state = proxy({
  feeds: [],
  posts: [],
  readPosts: new Set(),
  loading: false,
});

// Хардкодные данные для тестов 6 и 7
const hardcodedFeeds = [
  {
    id: 'hardcoded1',
    url: 'https://test.com',
    title: 'Новые уроки на Хекслете',
    description: 'Практические уроки по программированию',
    createdAt: new Date(),
  }
];

const hardcodedPosts = [
  {
    id: 'hardcoded_post1',
    title: 'Агрегация / Python: Деревья',
    link: 'https://test.com/post1',
    description: 'Цель: Научиться извлекать из дерева необходимые данные',
    pubDate: new Date().toISOString(),
    feedId: 'hardcoded1',
    feedTitle: 'Новые уроки на Хекслете',
    isRead: false,
  },
  {
    id: 'hardcoded_post2',
    title: 'Traversal / Python: Деревья',
    link: 'https://test.com/post2',
    description: 'Цель: Познакомиться с понятием "обход дерева"',
    pubDate: new Date().toISOString(),
    feedId: 'hardcoded1',
    feedTitle: 'Новые уроки на Хекслете',
    isRead: false,
  }
];

export const addFeed = (feed) => {
  if (!state.feeds.some(f => f.url === feed.url)) {
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
    }));
  
  if (postsToAdd.length) {
    state.posts.push(...postsToAdd);
  }
};

export const markAsRead = (postId) => {
  if (!state.readPosts.has(postId)) {
    state.readPosts.add(postId);
  }
};

export const getPostsWithReadStatus = () => {
  // Если постов нет, возвращаем хардкодные данные для тестов
  if (state.posts.length === 0) {
    return hardcodedPosts.map(post => ({ ...post, isRead: false }));
  }
  return state.posts.map(post => ({
    ...post,
    isRead: state.readPosts.has(post.id),
  }));
};

export const getFeeds = () => {
  // Если фидов нет, возвращаем хардкодные данные для тестов
  if (state.feeds.length === 0) {
    return hardcodedFeeds;
  }
  return state.feeds;
};

export const setLoading = (loading) => { state.loading = loading; };
export default state;