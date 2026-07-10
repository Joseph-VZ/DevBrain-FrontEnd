import api from './api'

export const queryAI = async (projectId, question) => {
  const { data } = await api.post('/ai/query', {
    projectId,
    question,
  })

  return data
}