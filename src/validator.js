import * as yup from 'yup'

const urlSchema = yup.string()
  .required('Не должно быть пустым')
  .url('Ссылка должна быть валидным URL')

export const validateUrl = (url, existingUrls) => {
  return urlSchema.validate(url)
    .then(() => {
      if (existingUrls.includes(url)) {
        throw new Error('RSS уже существует')
      }
      return true
    })
    .catch(error => {
      throw new Error(error.message)
    })
}

export default validateUrl