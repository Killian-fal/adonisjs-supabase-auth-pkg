import type { HttpContext } from '@adonisjs/core/http'
import Roles from '../decorators/roles.js'

export default class UsersController {
  async show({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return {
      hello: user.email ?? 'ERROR',
      role: user.details.role,
      name: user.profile.fullName,
    }
  }

  @Roles('ADMIN')
  async showWithRole({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    return {
      hello: user.email ?? 'ERROR',
      role: user.details.role,
      name: user.profile.fullName,
    }
  }
}
