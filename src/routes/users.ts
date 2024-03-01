import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'

export async function userRoutes(app: FastifyInstance) {
  app.get('/test', async (request, reply) => {
    return reply.status(201).send('Hello')
  })

  // cria usuario
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      email: z.string(),
      name: z.string(),
    })

    const { name, email } = createTransactionBodySchema.parse(request.body)

    console.log(name)
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }
    await knex('users').insert({
      id: crypto.randomUUID(),
      email,
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
