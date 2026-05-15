import * as yup from 'yup';

export default (feeds) =>
  yup.string()
    .required('notEmpty')
    .url('invalidUrl')
    .notOneOf(feeds.map((feed) => feed.url), 'alreadyExists');
