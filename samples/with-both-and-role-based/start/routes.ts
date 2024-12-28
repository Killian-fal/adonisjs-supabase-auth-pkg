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

const UsersController = () => import('#controllers/users_controller')

router
  .group(() => {
    router.get('/', [UsersController, 'show'])
    router.get('/admin', [UsersController, 'showWithRole'])
  })
  .use(middleware.auth())
