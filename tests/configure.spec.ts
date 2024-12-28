import { test } from '@japa/runner'
import { fileURLToPath } from 'node:url'
import { IgnitorFactory } from '@adonisjs/core/factories'
import Configure from '@adonisjs/core/commands/configure'

const BASE_URL = new URL('./tmp/', import.meta.url)

test.group('Configure', (group) => {
  group.each.setup(({ context }) => {
    context.fs.baseUrl = BASE_URL
    context.fs.basePath = fileURLToPath(BASE_URL)
  })

  group.each.disableTimeout()
  test('register guard and env', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    await fs.create(
      'start/kernel.ts',
      `router.use([])
    export const { middleware } = router.named({
    })`
    )
    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', `export default defineConfig({}) {}`)
    await fs.create(
      'start/env.ts',
      `export default await Env.create(new URL('../', import.meta.url), {
      })`
    )
    await fs.create(
      'config/auth.ts',
      `const authConfig = defineConfig({
        default: 'any',
        guards: {
        },
      })`
    )

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileContains(
      'app/utils/supabase_util.ts',
      "const supabase = createClient(env.get('SUPABASE_PROJECT_URL'), env.get('SUPABASE_API_KEY'))"
    )

    await assert.fileContains(
      'app/auth/guards/supabase_jwt_guard.ts',
      'export class SupabaseJwtGuard implements GuardContract<CustomSupabaseUser> {'
    )

    await assert.fileContains(
      'start/env.ts',
      'SUPABASE_PROJECT_URL: Env.schema.string()',
      'SUPABASE_API_KEY: Env.schema.string()'
    )

    await assert.fileContains(
      'config/auth.ts',
      "default: 'supabase'",
      'supabase: (ctx) => new SupabaseJwtGuard(ctx)'
    )
  })

  test('register without auth config', async ({ fs, assert }) => {
    const ignitor = new IgnitorFactory()
      .withCoreProviders()
      .withCoreConfig()
      .create(BASE_URL, {
        importer: (filePath) => {
          if (filePath.startsWith('./') || filePath.startsWith('../')) {
            return import(new URL(filePath, BASE_URL).href)
          }

          return import(filePath)
        },
      })

    await fs.create(
      'start/kernel.ts',
      `router.use([])
    export const { middleware } = router.named({
    })`
    )
    await fs.createJson('tsconfig.json', {})
    await fs.create('adonisrc.ts', `export default defineConfig({}) {}`)
    await fs.create(
      'start/env.ts',
      `export default await Env.create(new URL('../', import.meta.url), {
      })`
    )

    const app = ignitor.createApp('web')
    await app.init()
    await app.boot()

    const ace = await app.container.make('ace')
    const command = await ace.create(Configure, ['../../index.js'])
    await command.exec()

    await assert.fileContains(
      'app/utils/supabase_util.ts',
      "const supabase = createClient(env.get('SUPABASE_PROJECT_URL'), env.get('SUPABASE_API_KEY'))"
    )

    await assert.fileContains(
      'app/auth/guards/supabase_jwt_guard.ts',
      'export class SupabaseJwtGuard implements GuardContract<CustomSupabaseUser> {'
    )

    await assert.fileContains(
      'start/env.ts',
      'SUPABASE_PROJECT_URL: Env.schema.string()',
      'SUPABASE_API_KEY: Env.schema.string()'
    )

    command.assertFailed()
  })
})
