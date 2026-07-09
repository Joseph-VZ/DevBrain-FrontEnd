import api from './api'

/**
 * decisionService
 * Capa de acceso a los endpoints de decisiones y votos del backend DevBrain.
 *
 * Endpoints disponibles en el backend:
 *   GET  /decisions?projectId=  -> lista de decisiones de un proyecto
 *   POST /decisions             -> crea una decisión (con alternativas)
 *   POST /votes                 -> registra un voto (approve | reject)
 *
 * Nota: el backend aún no expone un GET de una decisión individual ni el
 * conteo de votos, por lo que el detalle se resuelve filtrando la lista y el
 * conteo se lleva de forma optimista en el cliente.
 */
export const decisionService = {
  getDecisions(projectId) {
    return api.get('/decisions', { params: { projectId } })
  },

  getDecision(projectId, decisionId) {
    return api
      .get('/decisions', { params: { projectId } })
      .then((response) => ({
        ...response,
        data: response.data.find((decision) => String(decision.id) === String(decisionId)) || null,
      }))
  },

  createDecision(decision) {
    return api.post('/decisions', decision)
  },

  vote(decisionId, vote) {
    // vote: 'approve' | 'reject'
    return api.post('/votes', { decisionId, vote })
  },

  getVotes(decisionId) {
    // -> { decisionId, approve, reject, total, myVote }
    return api.get('/votes', { params: { decisionId } })
  },
}
