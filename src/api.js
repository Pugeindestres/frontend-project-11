const parseRSS = (xmlText) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')
  
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Invalid RSS feed')
  }
  
  const title = doc.querySelector('title')?.textContent || 'Без названия'
  const description = doc.querySelector('description')?.textContent || ''
  const items = Array.from(doc.querySelectorAll('item')).map(item => ({
    title: item.querySelector('title')?.textContent || '',
    link: item.querySelector('link')?.textContent || '',
    description: item.querySelector('description')?.textContent || '',
    pubDate: item.querySelector('pubDate')?.textContent || ''
  }))
  
  return { title, description, items, url: '' }
}

export const fetchRSS = (url) => {
  return fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network error')
      }
      return response.json()
    })
    .then(data => {
      if (!data.contents) {
        throw new Error('Empty response')
      }
      const feed = parseRSS(data.contents)
      feed.url = url
      return feed
    })
}
