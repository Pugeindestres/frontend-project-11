import axios from 'axios';
import parseRSS from './parser.js';

export const loadRSS = (url) => {
  const proxyUrl = 'https://allorigins.hexlet.app/get';
  const requestUrl = `${proxyUrl}?disableCache=true&url=${encodeURIComponent(url)}`;
  
  return axios.get(requestUrl)
    .then(response => {
      if (response.data.status === 'error' || !response.data.contents) {
        throw new Error('networkError');
      }
      const content = response.data.contents;
      return parseRSS(content);
    })
    .catch(error => {
      if (error.message === 'noValidRSS') throw error;
      throw new Error('networkError');
    });
};