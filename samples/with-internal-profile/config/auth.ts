import { defineConfig } from '@adonisjs/auth'
import type { InferAuthenticators, InferAuthEvents, Authenticators } from '@adonisjs/auth/types'
import { SupabaseJwtGuard } from '../app/auth/guards/supabase_jwt_guard.js'

const authConfig = defineConfig({
  default: 'supabase',
  guards: {
    supabase: (ctx) => new SupabaseJwtGuard(ctx),
  },
})

export default authConfig

/**
 * Inferring types from the configured auth
 * guards.
 */
declare module '@adonisjs/auth/types' {
  export interface Authenticators extends InferAuthenticators<typeof authConfig> {}
}
declare module '@adonisjs/core/types' {
  interface EventsList extends InferAuthEvents<Authenticators> {}
}
