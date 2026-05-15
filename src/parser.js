export default (xmlString) => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml')

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('noValidRSS')
  }

  const channel = xmlDoc.querySelector('channel')
  if (!channel) {
    throw new Error('noValidRSS')
  }

  const feedTitle = channel.querySelector('title')?.textContent?.trim() || ''
  const feedDescription = channel.querySelector('description')?.textContent?.trim() || ''

  const posts = Array.from(channel.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent?.trim() || '',
    link: item.querySelector('link')?.textContent?.trim() || '',
    description: item.querySelector('description')?.textContent?.trim() || '',
    pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
  }))

  return { feed: { title: feedTitle, description: feedDescription }, posts }
}
