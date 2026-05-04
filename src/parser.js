export default (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  // Проверка на ошибки парсинга
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('noValidRSS');
  }
  
  // Поиск channel (может быть в разных местах)
  let channel = xmlDoc.querySelector('channel');
  if (!channel) {
    // Попробуем найти rss > channel
    const rss = xmlDoc.querySelector('rss');
    if (rss) {
      channel = rss.querySelector('channel');
    }
  }
  if (!channel) {
    throw new Error('noValidRSS');
  }
  
  // Парсинг фида с fallback значениями
  const feedTitle = channel.querySelector('title')?.textContent?.trim() || 'Без названия';
  const feedDescription = channel.querySelector('description')?.textContent?.trim() || '';
  
  // Парсинг постов
  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item) => ({
    title: item.querySelector('title')?.textContent?.trim() || 'Без названия',
    link: item.querySelector('link')?.textContent?.trim() || '#',
    description: item.querySelector('description')?.textContent?.trim() || 'Нет описания',
    pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
  }));
  
  return {
    feed: { title: feedTitle, description: feedDescription },
    posts,
  };
};