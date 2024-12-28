/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { HttpContext } from '@adonisjs/core/http'

router
  .get('/', async ({ auth }: HttpContext) => {
    const user = auth.getUserOrFail()
    return {
      hello: user.email ?? 'ERROR',
      role: user.details.role,
    }
  })
  .use(middleware.auth())
