import { it, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import { execSync } from 'child_process'

describe('Users routes', () => {
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

  it('should be able to create a new user', async () => {
    // fazer a chamada http para criar uma nova transação
    await request(app.server)
      .post('/users')
      .send({
        name: 'Gustavo Lyra',
        email: 'gustavolyra@live.com',
      })
      .expect(201)
  })
})
