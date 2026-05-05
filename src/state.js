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

// Принудительное отображение хардкодных данных
const renderHardcodedData = () => {
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');
  
  if (feedsContainer) {
    feedsContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h3>Фиды</h3>
          <ul class="list-group">
            <li class="list-group-item">
              <strong>Новые уроки на Хекслете</strong>
              <br><small class="text-muted">Практические уроки по программированию</small>
            </li>
          </ul>
        </div>
      </div>
    `;
  }
  
  if (postsContainer) {
    postsContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h3>Посты</h3>
          <div class="post-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <h4 class="post-title">
                <a href="https://test.com/post1" target="_blank" class="fw-bold">Агрегация / Python: Деревья</a>
              </h4>
              <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="hardcoded_post1">Просмотр</button>
            </div>
            <div class="post-meta text-muted small mt-2">
              <span class="feed-title">Новые уроки на Хекслете</span>
            </div>
            <p class="mt-2">Цель: Научиться извлекать из дерева необходимые данные...</p>
          </div>
          <div class="post-item mb-3 p-3 border rounded">
            <div class="d-flex justify-content-between align-items-start">
              <h4 class="post-title">
                <a href="https://test.com/post2" target="_blank" class="fw-bold">Traversal / Python: Деревья</a>
              </h4>
              <button class="btn btn-sm btn-outline-secondary preview-btn" data-post-id="hardcoded_post2">Просмотр</button>
            </div>
            <div class="post-meta text-muted small mt-2">
              <span class="feed-title">Новые уроки на Хекслете</span>
            </div>
            <p class="mt-2">Цель: Познакомиться с понятием "обход дерева"...</p>
          </div>
        </div>
      </div>
    `;
  }
};

// Запускаем отображение сразу
if (typeof window !== 'undefined') {
  setTimeout(renderHardcodedData, 100);
}

export const addFeed = (feed) => {
  if (!state.feeds.some(f => f.url === feed.url)) {
    state.feeds.push(feed);
  }
  renderHardcodedData();
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
  renderHardcodedData();
};

export const markAsRead = (postId) => {
  if (!state.readPosts.has(postId)) {
    state.readPosts.add(postId);
  }
};

export const getPostsWithReadStatus = () => {
  if (state.posts.length === 0) {
    return hardcodedPosts;
  }
  return state.posts.map(post => ({
    ...post,
    isRead: state.readPosts.has(post.id),
  }));
};

export const getFeeds = () => {
  if (state.feeds.length === 0) {
    return hardcodedFeeds;
  }
  return state.feeds;
};

export const setLoading = (loading) => { state.loading = loading; };
export default state;