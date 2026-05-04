import { proxy } from 'valtio/vanilla';

const state = proxy({
  feeds: [],
  posts: [],
  readPosts: new Set(),
  loading: false,
  error: null,
});

export const addFeed = (feed) => {
  console.log('=== addFeed called ===');
  console.log('Feed to add:', feed);
  
  const exists = state.feeds.some(f => f.url === feed.url);
  if (!exists) {
    state.feeds.push(feed);
    console.log('Feed added. Current feeds count:', state.feeds.length);
    console.log('Feeds:', state.feeds);
  } else {
    console.log('Feed already exists, not adding');
  }
};

export const addPosts = (feedId, newPosts) => {
  console.log('=== addPosts called ===');
  console.log('feedId:', feedId);
  console.log('newPosts count:', newPosts.length);
  console.log('First post title:', newPosts[0]?.title);
  
  const existingLinks = new Set(state.posts.map(p => p.link));
  const postsToAdd = newPosts
    .filter(post => !existingLinks.has(post.link))
    .map(post => ({
      ...post,
      id: `${feedId}_${Date.now()}_${Math.random()}`,
      feedId,
      feedTitle: post.feedTitle || '',
    }));
  
  console.log('Posts to add after filtering:', postsToAdd.length);
  
  if (postsToAdd.length > 0) {
    state.posts.push(...postsToAdd);
    console.log('Posts added. Total posts:', state.posts.length);
    console.log('First added post title:', postsToAdd[0]?.title);
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