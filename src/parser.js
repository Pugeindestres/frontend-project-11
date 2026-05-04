export default (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('noValidRSS');
  }
  
  const channel = xmlDoc.querySelector('channel');
  if (!channel) {
    throw new Error('noValidRSS');
  }
  
  const feedTitle = channel.querySelector('title')?.textContent || '';
  const feedDescription = channel.querySelector('description')?.textContent || '';
  
  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
  }));
  
  return {
    feed: { title: feedTitle, description: feedDescription },
    posts,
  };
};