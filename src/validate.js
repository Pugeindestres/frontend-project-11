// src/validate.js
import * as yup from 'yup';

export default (feeds) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(feeds.map(feed => feed.url));
  
  return schema;
};