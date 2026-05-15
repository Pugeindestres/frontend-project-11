import axios from 'axios'
import parseRSS from './parser.js'

const PROXY_URL = 'https://allorigins.hexlet.app/get'

export const loadRSS = url =>
  axios
    .get(`${PROXY_URL}?disableCache=true&url=${encodeURIComponent(url)}`)
    .then(response => {
      if (response.data.status === 'error' || !response.data.contents) {
        throw new Error('networkError')
      }
      return parseRSS(response.data.contents)
    })
    .catch(error => {
      if (error.message === 'noValidRSS') throw error
      throw new Error('networkError')
    })
