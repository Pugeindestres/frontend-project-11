import i18next from 'i18next'

export const resources = {
  ru: {
    translation: {
      appTitle: 'RSS Агрегатор',
      appDescription: 'Начните читать RSS сегодня! Это легко и удобно.',
      
      rssLabel: 'Ссылка RSS',
      addButton: 'Добавить',
      placeholder: 'https://example.com/rss.xml',
      loading: 'Загрузка...',
      
      feeds: 'Фиды',
      posts: 'Посты',
      noFeeds: 'Нет добавленных фидов',
      noPosts: 'Нет постов',
      noTitle: 'Без названия',
      
      showPosts: 'Показать посты',
      hidePosts: 'Скрыть посты',
      
      errors: {
        required: 'Не должно быть пустым',
        invalidUrl: 'Ссылка должна быть валидным URL',
        duplicate: 'RSS уже существует',
        networkError: 'Ошибка сети',
        emptyResponse: 'Пустой ответ от сервера',
        invalidRss: 'Неверный RSS формат'
      }
    }
  }
}

export const initI18n = () => {
  return i18next.init({
    resources,
    lng: 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false
    }
  })
}

export default i18next
