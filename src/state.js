import { proxy } from 'valtio/vanilla'

const state = proxy({
  feeds: [],
  posts: [],
  form: {
    url: '',
    isValid: true,
    error: null,
    isSubmitting: false
  }
})

export default state
