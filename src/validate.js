import * as yup from 'yup';

export default (feeds) => {
  const schema = yup.string()
    .required('notEmpty')
    .url('invalidUrl')
    .notOneOf(feeds.map(feed => feed.url), 'alreadyExists');
  
  return schema;
};