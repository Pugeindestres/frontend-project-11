import { proxy } from 'valtio/vanilla'

const state = proxy({
  feeds: [],
  form: {
    url: '',
    isValid: true,
    error: null,
    isSubmitting: false
  }
})

export default state
