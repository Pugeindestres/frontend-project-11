import * as yup from 'yup';

export default (feeds) => {
  const schema = yup.string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds.map(feed => feed.url), 'RSS уже существует');
  
  return schema;
};