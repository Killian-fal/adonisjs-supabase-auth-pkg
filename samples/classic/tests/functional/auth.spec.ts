import { test } from '@japa/runner'

test.group('Auth', () => {
  test('test authentication', async ({ client }) => {
    const user = {
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      email: 'test@test.fr',
      app_metadata: {},
      user_metadata: {},
      aud: 'auth',
      created_at: 'never ;)',
      details: {},
    }

    const response = await client.get('/').loginAs(user)
    response.assertStatus(200)
    response.assertBody({
      hello: 'test@test.fr',
    })
  })
})
