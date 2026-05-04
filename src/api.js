import axios from 'axios';
import parseRSS from './parser.js';

const proxyUrl = 'https://allorigins.hexlet.app/get';

export const loadRSS = (url) => {
  const encodedUrl = encodeURIComponent(url);
  const requestUrl = `${proxyUrl}?disableCache=true&url=${encodedUrl}`;
  
  return axios.get(requestUrl)
    .then(response => {
      if (response.data.status === 'error' || !response.data.contents) {
        throw new Error('networkError');
      }
      const content = response.data.contents;
      const parsed = parseRSS(content);
      return parsed;
    })
    .catch(error => {
      if (error.message === 'noValidRSS') throw error;
      throw new Error('networkError');
    });
};