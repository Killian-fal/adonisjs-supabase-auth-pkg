import { Exception } from '@adonisjs/core/exceptions'

class ConfigureAuthConfigException extends Exception {
  constructor() {
    super(`Error while modifying config/auth.ts`)
  }
}

export { ConfigureAuthConfigException }
