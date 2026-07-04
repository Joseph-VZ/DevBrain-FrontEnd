import api from './api'

export const projectService = {
  getProjects() {
    return api.get('/projects')
  },

  createProject(project) {
    return api.post('/projects', project)
  },
}
