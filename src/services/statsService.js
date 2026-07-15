import api from './api'

export const statsService = {
  getProjectStats(projectId) {
    return api.get(`/projects/${projectId}/stats`)
  },
}