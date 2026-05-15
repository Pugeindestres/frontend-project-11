import { loadRSS } from './api.js';
import state, { addPosts, getPostsWithReadStatus } from './state.js';
import { renderPosts, openModal } from './view.js';
import { markAsRead } from './state.js';

let timeout = null;
let updating = false;

export const startUpdater = (interval = 5000) => {
  if (timeout) clearTimeout(timeout);

  const tick = () => {
    if (updating) {
      timeout = setTimeout(tick, interval);
      return;
    }
    updating = true;

    Promise.all(state.feeds.map((feed) =>
      loadRSS(feed.url).then(({ posts }) => {
        addPosts(feed.id, posts);
      }).catch(() => {}),
    )).finally(() => {
      updating = false;
      timeout = setTimeout(tick, interval);
    });
  };

  timeout = setTimeout(tick, interval);
};

export const stopUpdater = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  updating = false;
};
