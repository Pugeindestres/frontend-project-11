import { loadRSS } from './api.js';
import state, { addPosts, getPostsWithReadStatus } from './state.js';
import { renderPosts } from './view.js';

let timeout = null;
let updating = false;

export const startUpdater = (interval = 5000) => {
  if (timeout) clearTimeout(timeout);
  const tick = () => {
    if (updating) { timeout = setTimeout(tick, interval); return; }
    updating = true;
    Promise.all(state.feeds.map(feed =>
      loadRSS(feed.url).then(({ posts }) => {
        const newPosts = posts.filter(p => !state.posts.some(ex => ex.link === p.link));
        if (newPosts.length) {
          addPosts(feed.id, newPosts);
          const container = document.getElementById('postsContainer');
          if (container) renderPosts(container, getPostsWithReadStatus(), null);
        }
      }).catch(() => {})
    )).finally(() => { updating = false; timeout = setTimeout(tick, interval); });
  };
  timeout = setTimeout(tick, interval);
};

export const stopUpdater = () => { if (timeout) { clearTimeout(timeout); timeout = null; updating = false; } };