import ru from './locales.js';
import { validateUrl, validateRSSContent } from './validator.js';
import { getFeeds, addFeed, addPosts, getPosts } from './state.js';
import { showFeedback } from './view.js';

export async function addRSSFeed(url) {
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    showFeedback(urlValidation.error, true);
    return false;
  }

  const feeds = getFeeds();
  if (feeds.some(feed => feed.url === url)) {
    showFeedback(ru.alreadyExists, true);
    return false;
  }

  try {
    // ===== ВАЖНО: прямой fetch без прокси =====
    const response = await fetch(url);
    // =========================================

    if (!response.ok) {
      throw new Error('Network error');
    }

    const text = await response.text();

    const rssValidation = validateRSSContent(text);

    if (!rssValidation.isValid) {
      showFeedback(rssValidation.error, true);
      return false;
    }

    const { xmlDoc } = rssValidation;
    const channel = xmlDoc.querySelector('channel');
    const title = channel.querySelector('title')?.textContent || url;

    const feed = {
      id: Date.now().toString(),
      url,
      title,
      createdAt: new Date(),
    };

    addFeed(feed);

    const posts = parsePosts(xmlDoc, feed.id, title);
    addPosts(feed.id, posts);

    showFeedback(ru.successLoad, false);
    return true;
  } catch (error) {
    console.error('Error adding RSS:', error);
    showFeedback(ru.networkError, true);
    return false;
  }
}

function parsePosts(xmlDoc, feedId, feedTitle) {
  const items = xmlDoc.querySelectorAll('item');
  const posts = [];

  items.forEach(item => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const pubDateStr = item.querySelector('pubDate')?.textContent || '';
    const pubDate = new Date(pubDateStr);

    posts.push({
      id: `${feedId}_${Date.now()}_${Math.random()}`,
      title,
      link,
      description,
      pubDate: isNaN(pubDate.getTime()) ? new Date() : pubDate,
      feedTitle,
    });
  });

  return posts;
}

export async function loadPosts(url, options = {}) {
  const { skipExisting = false, lastPostDate = null } = options;

  try {
    // ===== ВАЖНО: прямой fetch без прокси =====
    const response = await fetch(url);
    // =========================================

    const text = await response.text();

    const rssValidation = validateRSSContent(text);

    if (!rssValidation.isValid) {
      return [];
    }

    const { xmlDoc } = rssValidation;
    const channel = xmlDoc.querySelector('channel');
    const feedTitle = channel.querySelector('title')?.textContent || url;
    let posts = parsePosts(xmlDoc, null, feedTitle);

    if (skipExisting) {
      const existingPosts = getPosts();
      const existingUrls = new Set(existingPosts.map(p => p.link));
      posts = posts.filter(post => !existingUrls.has(post.link));
    }

    if (lastPostDate) {
      posts = posts.filter(post => new Date(post.pubDate) > lastPostDate);
    }

    return posts;
  } catch (error) {
    console.error('Error loading posts:', error);
    return [];
  }
}