import axios from 'axios';
import parseRSS from './parser.js';

const PROXY_URL = 'https://allorigins.hexlet.app/get';

export const loadRSS = (url) => {
  return axios.get(`${PROXY_URL}?disableCache=true&url=${encodeURIComponent(url)}`)
    .then(response => {
      if (response.data.status === 'error' || !response.data.contents) {
        throw new Error('networkError');
      }
      return parseRSS(response.data.contents);
    })
    .catch(error => {
      throw new Error(error.message === 'noValidRSS' ? 'noValidRSS' : 'networkError');
    });
};