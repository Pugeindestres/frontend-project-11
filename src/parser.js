export default (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('noValidRSS');
  }
  
  let channel = xmlDoc.querySelector('channel');
  if (!channel) {
    const rss = xmlDoc.querySelector('rss');
    if (rss) {
      channel = rss.querySelector('channel');
    }
  }
  if (!channel) {
    throw new Error('noValidRSS');
  }
  
  const feedTitle = channel.querySelector('title')?.textContent?.trim() || '';
  const feedDescription = channel.querySelector('description')?.textContent?.trim() || '';
  
  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    description: item.querySelector('description')?.textContent?.trim() || '',
    pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
  }));
  
  return {
    feed: { title: feedTitle, description: feedDescription },
    posts,
  };
};