import * as yup from 'yup';

export default (feeds) => {
  const schema = yup.string()
    .required('Не должно быть пустым')
    .test('valid-url', 'Ссылка должна быть валидным URL', (value) => {
      if (!value) return false;
      return value.startsWith('http://') || value.startsWith('https://');
    })
    .notOneOf(feeds.map(feed => feed.url), 'RSS уже существует');
  
  return schema;
};