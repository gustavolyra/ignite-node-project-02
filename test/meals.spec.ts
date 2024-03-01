import { it, beforeAll, afterAll, describe, beforeEach, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a meal', async () => {
    await request(app.server)
      .post('/meals')
      .send({
        description: 'salada de frutas',
        meal: 'cafe da manhã',
        dateTime: '2022-10-01T04:00:00.000Z',
        isOnDiet: true,
      })
      .expect(201)
  })

  it('should be able to see all meal', async () => {
    // fazer a chamada http para criar uma nova transação

    const test = await request(app.server).post('/meals').send({
      description: 'salada de frutas',
      meal: 'cafe da manhã',
      dateTime: '2022-10-01T04:00:00.000Z',
      isOnDiet: true,
    })
    const cookie = test.get('Set-cookie')

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)

    expect(mealResponse.body.meals).toEqual([
      expect.objectContaining({
        description: 'salada de frutas',
        meal: 'cafe da manhã',
        dateTime: '2022-10-01T04:00:00.000Z',
        isOnDiet: 1,
      }),
    ])
  })

  it('should be able to see meal by id', async () => {
    // fazer a chamada http para criar uma nova transação

    const test = await request(app.server).post('/meals').send({
      description: 'salada de frutas',
      meal: 'cafe da manhã',
      dateTime: '2022-10-01T04:00:00.000Z',
      isOnDiet: true,
    })
    const cookie = test.get('Set-cookie')

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)

    const mealId = mealResponse.body.meals[0].id
    const getMealByIdResonse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getMealByIdResonse.body.diet).toEqual(
      expect.objectContaining({
        id: mealId,
        description: 'salada de frutas',
        meal: 'cafe da manhã',
        dateTime: '2022-10-01T04:00:00.000Z',
        isOnDiet: 1,
      }),
    )
  })

  it('should be able to delete meal by id', async () => {
    // fazer a chamada http para criar uma nova transação

    const test = await request(app.server).post('/meals').send({
      description: 'salada de frutas',
      meal: 'cafe da manhã',
      dateTime: '2022-10-01T04:00:00.000Z',
      isOnDiet: true,
    })
    const cookie = test.get('Set-cookie')

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)

    const mealId = mealResponse.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should be able to edit meal by id', async () => {
    // fazer a chamada http para criar uma nova transação

    const test = await request(app.server).post('/meals').send({
      description: 'salada de frutas',
      meal: 'cafe da manhã',
      dateTime: '2022-10-01T04:00:00.000Z',
      isOnDiet: true,
    })
    const cookie = test.get('Set-cookie')

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookie)

    const mealId = mealResponse.body.meals[0].id
    await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .send({
        description: 'salada de frutas',
        meal: 'cafe da manhã',
        dateTime: '2022-10-01T04:00:00.000Z',
        isOnDiet: false,
      })
      .expect(201)
    const getMealByIdResonse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(getMealByIdResonse.body.diet).toEqual(
      expect.objectContaining({
        id: mealId,
        description: 'salada de frutas',
        meal: 'cafe da manhã',
        dateTime: '2022-10-01T04:00:00.000Z',
        isOnDiet: 0,
      }),
    )
  })
  it('should be able to see informations about', async () => {
    // fazer a chamada http para criar uma nova transação

    const test = await request(app.server).post('/meals').send({
      description: 'salada de frutas',
      meal: 'cafe da manhã',
      dateTime: '2022-10-01T04:00:00.000Z',
      isOnDiet: true,
    })
    const cookie = test.get('Set-cookie')

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      description: 'frango com arros',
      meal: 'almoç',
      dateTime: '2022-10-01T12:00:00.000Z',
      isOnDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookie).send({
      description: 'pizza',
      meal: 'janta',
      dateTime: '2022-10-01T18:00:00.000Z',
      isOnDiet: false,
    })

    const mealInformationResponse = await request(app.server)
      .get('/meals/informations')
      .set('Cookie', cookie)

    console.log('body:')
    console.log(mealInformationResponse.body)
    expect(mealInformationResponse.body).toEqual(
      expect.objectContaining({
        'Total number of meals:': 3,
        'Total number of meals on diet:': 1,
        'Total number of meals out side diet:': 2,
        'Best streak of meals on diet': 1,
      }),
    )
  })
})
