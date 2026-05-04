export async function addRSSFeed(url) {
  console.log('addRSSFeed called with:', url); // Отладка
  
  const urlValidation = validateUrl(url);
  if (!urlValidation.isValid) {
    console.log('URL validation failed:', urlValidation.error); // Отладка
    showFeedback(urlValidation.error, true);
    return false;
  }
  
  const feeds = getFeeds();
  console.log('Current feeds:', feeds); // Отладка
  
  if (feeds.some(feed => feed.url === url)) {
    console.log('Feed already exists'); // Отладка
    showFeedback(ru.alreadyExists, true);
    return false;
  }
  
  try {
    console.log('Fetching RSS from:', url); // Отладка
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    const text = data.contents;
    
    console.log('RSS fetched, length:', text.length); // Отладка
    
    const rssValidation = validateRSSContent(text);
    
    if (!rssValidation.isValid) {
      console.log('RSS validation failed:', rssValidation.error); // Отладка
      showFeedback(rssValidation.error, true);
      return false;
    }
    
    const { xmlDoc } = rssValidation;
    const channel = xmlDoc.querySelector('channel');
    const title = channel.querySelector('title')?.textContent || url;
    
    console.log('Feed title:', title); // Отладка
    
    const feed = {
      id: Date.now().toString(),
      url,
      title,
      createdAt: new Date(),
    };
    
    addFeed(feed);
    
    const posts = parsePosts(xmlDoc, feed.id, title);
    console.log('Posts parsed:', posts.length); // Отладка
    
    addPosts(feed.id, posts);
    
    showFeedback(ru.successLoad, false);
    console.log('RSS added successfully!'); // Отладка
    return true;
    
  } catch (error) {
    console.error('Error in addRSSFeed:', error); // Отладка
    showFeedback(ru.networkError, true);
    return false;
  }
}