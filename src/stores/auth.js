import { defineStore } from 'pinia'

const storedToken = localStorage.getItem('devbrain_token')
const storedUser = localStorage.getItem('devbrain_user')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: storedToken || null,
    user: storedUser ? JSON.parse(storedUser) : null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    setSession({ token, user }) {
      this.token = token
      this.user = user

      localStorage.setItem('devbrain_token', token)
      localStorage.setItem('devbrain_user', JSON.stringify(user))
    },

    logout() {
      this.token = null
      this.user = null

      localStorage.removeItem('devbrain_token')
      localStorage.removeItem('devbrain_user')
    },
  },
})
