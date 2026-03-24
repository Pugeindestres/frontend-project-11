import * as yup from 'yup'
import i18next from './locales.js'

// Настройка сообщений yup на русском
yup.setLocale({
  mixed: {
    required: () => i18next.t('errors.required'),
    notType: () => i18next.t('errors.invalidUrl')
  },
  string: {
    url: () => i18next.t('errors.invalidUrl')
  }
})

// Создание схемы валидации
const createUrlSchema = () => {
  return yup.string()
    .required()
    .url()
}

export const validateUrl = (url, existingUrls) => {
  const schema = createUrlSchema()
  
  return schema.validate(url)
    .then(() => {
      if (existingUrls.includes(url)) {
        throw new Error(i18next.t('errors.duplicate'))
      }
      return true
    })
    .catch(error => {
      throw new Error(error.message)
    })
}

export default validateUrl
