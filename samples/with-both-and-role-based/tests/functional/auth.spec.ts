import Profile from '#models/profile'
import { test } from '@japa/runner'

test.group('Auth', (group) => {
  group.each.teardown(async () => {
    await Profile.query().delete()
  })
  test('test authentication', async ({ client }) => {
    const user = {
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      email: 'test@test.fr',
      app_metadata: {},
      user_metadata: {},
      aud: 'auth',
      created_at: 'never ;)',
      profile: new Profile(),
      details: {
        role: 'ROLE_ADMIN',
      },
    }

    const response = await client.get('/').loginAs(user)
    response.assertStatus(200)
    response.assertBody({
      hello: 'test@test.fr',
      role: 'ROLE_ADMIN',
      name: 'test@test.fr',
    })
  })

  test('test authentication with existing profile', async ({ client }) => {
    await Profile.create({
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      fullName: 'Killian',
      email: 'Yes',
    })

    const user = {
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      email: 'test@test.fr',
      app_metadata: {},
      user_metadata: {},
      aud: 'auth',
      created_at: 'never ;)',
      profile: new Profile(),
      details: {
        role: 'ROLE_ADMIN',
      },
    }

    const response = await client.get('/').loginAs(user)
    response.assertStatus(200)
    response.assertBody({
      hello: 'test@test.fr',
      role: 'ROLE_ADMIN',
      name: 'Killian',
    })
  })

  test('test authentication with correct role', async ({ client }) => {
    const user = {
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      email: 'test@test.fr',
      app_metadata: {},
      user_metadata: {},
      aud: 'auth',
      created_at: 'never ;)',
      profile: new Profile(),
      details: {
        role: 'ADMIN',
      },
    }

    const response = await client.get('/admin').loginAs(user)
    response.assertStatus(200)
    response.assertBody({
      hello: 'test@test.fr',
      role: 'ADMIN',
      name: 'test@test.fr',
    })
  })

  test('test authentication with incorrect role', async ({ client }) => {
    const user = {
      id: 'e4eaaaf2-d142-11e1-b3e4-080027620cdd',
      email: 'test@test.fr',
      app_metadata: {},
      user_metadata: {},
      aud: 'auth',
      created_at: 'never ;)',
      profile: new Profile(),
      details: {
        role: 'ROLE_ADMIN',
      },
    }

    const response = await client.get('/admin').loginAs(user)
    response.assertStatus(403)
  })
})
