import { proxy } from 'valtio/vanilla';

const state = proxy({
  feeds: [],
  posts: [],
  readPosts: new Set(),
  loading: false,
});

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

export const getPostsWithReadStatus = () => state.posts.map(post => ({
  ...post,
  isRead: state.readPosts.has(post.id),
}));

export const setLoading = (loading) => { state.loading = loading; };
export default state;