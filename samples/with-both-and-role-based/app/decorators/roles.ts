import type { HttpContext } from '@adonisjs/core/http'

const Roles = (...allowedRoles: string[]) => {
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (context: HttpContext, ...args: any[]) {
      const { response, auth } = context
      const role = auth.getUserOrFail().details.role

      if (!role || !allowedRoles.includes(role)) {
        return response.forbidden()
      }

      return originalMethod.apply(this, [context, ...args])
    }

    return descriptor
  }
}

export default Roles
