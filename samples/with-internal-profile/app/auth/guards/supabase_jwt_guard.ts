import { errors, symbols } from '@adonisjs/auth'
import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import { HttpContext } from '@adonisjs/core/http'
import { supabase } from '../../utils/supabase_util.js'
import { User } from '@supabase/supabase-js'
import jwt, { JwtPayload } from 'jsonwebtoken'
import app from '@adonisjs/core/services/app'
import Profile from '#models/profile'
import { getOrCreateProfile } from '#services/profiles_service'

export class SupabaseJwtGuard implements GuardContract<CustomSupabaseUser> {
  #ctx: HttpContext

  constructor(ctx: HttpContext) {
    this.#ctx = ctx
  }

  declare [symbols.GUARD_KNOWN_EVENTS]: {}

  driverName: 'supabase' = 'supabase'

  authenticationAttempted: boolean = false

  isAuthenticated: boolean = false

  user?: CustomSupabaseUser

  /**
   * Authenticate the current HTTP request and return
   * the user instance if there is a valid JWT token
   * or throw an exception
   */
  async authenticate(): Promise<CustomSupabaseUser> {
    if (app.inTest) {
      //Skip authentication process due to testing
      return await this.testingAuthenticate()
    }

    /**
     * Avoid re-authentication when it has been done already
     * for the given request
     */
    if (this.authenticationAttempted) {
      return this.getUserOrFail()
    }
    this.authenticationAttempted = true

    /**
     * Ensure the auth header exists
     */
    const authHeader = this.#ctx.request.header('authorization')
    if (!authHeader) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    /**
     * Split the header value and read the token from it
     */
    const [, token] = authHeader.split('Bearer ')
    if (!token) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    /**
     * Get user data from supabase
     */
    const {
      data: { user },
    } = await supabase.auth.getUser(token)

    if (!user) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    this.user = await this.buildCustomSupabaseUser(token, user)
    return this.getUserOrFail()
  }

  /**
   * Same as authenticate, but does not throw an exception
   */
  async check(): Promise<boolean> {
    try {
      await this.authenticate()
      return true
    } catch {
      return false
    }
  }

  /**
   * Returns the authenticated user or throws an error
   */
  getUserOrFail(): CustomSupabaseUser {
    if (!this.user) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    return this.user
  }

  /**
   * This method is called by Japa during testing when "loginAs"
   * method is used to login the user.
   */
  async authenticateAsClient(user: CustomSupabaseUser): Promise<AuthClientResponse> {
    return {
      headers: {
        testingUser: JSON.stringify(user),
      },
    }
  }

  async buildCustomSupabaseUser(token: string, user: User): Promise<CustomSupabaseUser> {
    const customPayload = jwt.decode(token) as CustomSupabaseJwtPayload
    const profile = await getOrCreateProfile(user)

    return {
      ...user,
      details: customPayload.details,
      profile,
    }
  }

  async testingAuthenticate(): Promise<CustomSupabaseUser> {
    const testingUser = this.#ctx.request.header('testingUser')
    if (!testingUser) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    this.authenticationAttempted = true

    const decodedUser = JSON.parse(testingUser)
    this.user = {
      ...decodedUser,
      profile: await getOrCreateProfile(decodedUser),
    }
    return this.getUserOrFail()
  }
}

export interface CustomSupabaseUser extends User {
  details: CustomSupabaseUserDetails
  profile: Profile
}

export interface CustomSupabaseUserDetails {
  // TODO: Add here your custom details
  // e.g. role: string | null
}

export interface CustomSupabaseJwtPayload extends JwtPayload {
  details: CustomSupabaseUserDetails
}
