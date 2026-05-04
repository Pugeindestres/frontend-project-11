let state = {
  feeds: [],
  posts: [],
  readPosts: new Set(),
};

const subscribers = {
  feeds: [],
  posts: [],
  readPosts: [],
};

export function initState() {
  const saved = localStorage.getItem('rss-aggregator');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      state.feeds = data.feeds || [];
      state.posts = data.posts || [];
      state.readPosts = new Set(data.readPosts || []);
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
}

function saveState() {
  const toSave = {
    feeds: state.feeds,
    posts: state.posts,
    readPosts: Array.from(state.readPosts),
  };
  localStorage.setItem('rss-aggregator', JSON.stringify(toSave));
}

export function subscribe(event, callback) {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  subscribers[event].push(callback);
}

function notify(event, data) {
  if (subscribers[event]) {
    subscribers[event].forEach(callback => callback(data));
  }
}

export function getFeeds() {
  return [...state.feeds];
}

export function getPosts() {
  return [...state.posts];
}

export function getPostsWithReadStatus() {
  return state.posts.map(post => ({
    ...post,
    isRead: state.readPosts.has(post.id)
  }));
}

export function isRead(postId) {
  return state.readPosts.has(postId);
}

export function addFeed(feed) {
  const exists = state.feeds.some(f => f.url === feed.url);
  if (!exists) {
    state.feeds = [feed, ...state.feeds];
    saveState();
    notify('feeds', state.feeds);
    return true;
  }
  return false;
}

export function addPosts(feedId, newPosts) {
  const existingIds = new Set(state.posts.map(p => p.id));
  const postsToAdd = newPosts
    .filter(post => !existingIds.has(post.id))
    .map(post => ({
      ...post,
      feedId,
      id: `${feedId}_${Date.now()}_${Math.random()}`,
    }));
  
  if (postsToAdd.length > 0) {
    state.posts = [...postsToAdd, ...state.posts];
    saveState();
    notify('posts', state.posts);
  }
  
  return postsToAdd.length;
}

export function markAsRead(postId) {
  if (!state.readPosts.has(postId)) {
    state.readPosts.add(postId);
    saveState();
    notify('readPosts', state.readPosts);
    notify('posts', state.posts);
  }
}