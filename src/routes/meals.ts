import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middleware/check-session-id'

declare module 'knex/types/result' {
  interface Registry {
    Count: number
  }
}

export async function mealRoutes(app: FastifyInstance) {
  app.get('/test', async (request, reply) => {
    return reply.status(201).send('Hello')
  })

  // retorna todas as refeições de um usuario
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies
    const meals = await knex('meals').where('session_id', sessionId).select()

    return { meals }
  })

  // retorna refeição com base no ID
  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getDietParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getDietParamsSchema.parse(request.params)

    const diet = await knex('meals').where('id', id).first()

    return { diet }
  })

  // Deleta refeição com base no ID
  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getDietParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getDietParamsSchema.parse(request.params)

      await knex('meals').where('id', id).delete()

      return reply.status(200).send('Deleted')
    },
  )

  // Atualiza uma refeição
  app.patch('/:id', async (request, reply) => {
    const getDietBodySchema = z.object({
      description: z.string(),
      meal: z.string(),
      dateTime: z.string(),
      isOnDiet: z.boolean(),
    })

    const getDietParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getDietParamsSchema.parse(request.params)

    const { description, meal, dateTime, isOnDiet } = getDietBodySchema.parse(
      request.body,
    )

    await knex('meals').where('id', id).update({
      description,
      dateTime,
      isOnDiet,
      meal,
    })

    return reply.status(201).send()
  })

  // Cria uma refeição
  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      description: z.string(),
      meal: z.string(),
      dateTime: z.string(),
      isOnDiet: z.boolean(),
    })

    const { description, meal, dateTime, isOnDiet } =
      createTransactionBodySchema.parse(request.body)

    console.log(meal)
    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }
    await knex('meals').insert({
      id: crypto.randomUUID(),
      description,
      dateTime,
      isOnDiet,
      meal,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  // retorna dados sobre as refeiçoes do usuario
  app.get(
    '/informations',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const { sessionId } = request.cookies
      const totalNumberOfMeals = await knex('meals')
        .where('session_id', sessionId)
        .count('id', { as: 'total' })
        .first()

      const totalNumberOfMealsOnDiet = await knex('meals')
        .where({
          session_id: sessionId,
          isOnDiet: true,
        })
        .count('id', { as: 'total' })
        .first()

      const totalNumberOfMealsOutSideDiet = await knex('meals')
        .where({
          session_id: sessionId,
          isOnDiet: false,
        })
        .count('id', { as: 'total' })
        .first()

      const meals = await knex('meals').where('session_id', sessionId).select()

      const { maxStreak } = meals.reduce(
        (acc, meal) => {
          if (meal.isOnDiet) {
            acc.streak += 1
          } else {
            acc.streak = 0
          }
          if (acc.streak > acc.maxStreak) {
            acc.maxStreak = acc.streak
          }

          return acc
        },
        { maxStreak: 0, streak: 0 },
      )

      return {
        'Total number of meals:': totalNumberOfMeals?.total,
        'Total number of meals on diet:': totalNumberOfMealsOnDiet?.total,
        'Total number of meals out side diet:':
          totalNumberOfMealsOutSideDiet?.total,
        'Best streak of meals on diet': maxStreak,
      }
    },
  )
}
