import api from './api'

export const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  register(user) {
    return api.post('/auth/register', user)
  },
}
