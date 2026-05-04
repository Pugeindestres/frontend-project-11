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
    // ===== ВАЖНО: используйте относительный путь /proxy =====
    const proxyUrl = `/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    // ========================================================

    if (!response.ok) {
      throw new Error('Network error');
    }

    const data = await response.json();
    const text = data.contents || data;

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
