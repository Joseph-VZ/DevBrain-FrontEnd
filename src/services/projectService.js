import api from './api'

export const projectService = {
  getProjects() {
    return api.get('/projects')
  },

  createProject(project) {
    return api.post('/projects', project)
  },

  getProject(projectId) {
    return api.get(`/projects/${projectId}`)
  },

  getMembers(projectId) {
    return api.get(`/projects/${projectId}/members`)
  },

  getInvitations(projectId) {
    return api.get(`/projects/${projectId}/invitations`)
  },

  invite(projectId, { email, role }) {
    return api.post(`/projects/${projectId}/invitations`, { email, role })
  },

  cancelInvitation(projectId, invitationId) {
    return api.delete(`/projects/${projectId}/invitations/${invitationId}`)
  },

  getInvitation(token) {
    return api.get(`/invitations/${token}`)
  },

  acceptInvitation(token) {
    return api.post('/invitations/accept', { token })
  },
}
