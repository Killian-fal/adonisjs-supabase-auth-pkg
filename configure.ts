/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'
import { SyntaxKind } from 'ts-morph'
import { Codemods } from '@adonisjs/core/ace/codemods'
import { ConfigureAuthConfigException } from './src/exceptions.js'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  // install needed package
  await codemods.installPackages([
    { name: '@adonisjs/auth', isDevDependency: false },
    { name: '@supabase/supabase-js', isDevDependency: false },
    { name: 'jsonwebtoken', isDevDependency: false },
    { name: '@types/jsonwebtoken', isDevDependency: false },
  ])

  // Add nes env variables
  await configureEnv(codemods)

  // generate the guard and the util for supabase
  await codemods.makeUsingStub(stubsRoot, 'supabase_jwt_guard.stub', {})
  await codemods.makeUsingStub(stubsRoot, 'supabase_util.stub', {})

  // update the adonis auth configuration
  await configureAuth(command, codemods)
}

const configureEnv = async (codemods: Codemods) => {
  await codemods.defineEnvVariables({
    SUPABASE_PROJECT_URL: 'TO COMPLETE',
    SUPABASE_API_KEY: 'TO COMPLETE',
  })

  await codemods.defineEnvValidations({
    leadingComment: 'App environment variables for supabase',
    variables: {
      SUPABASE_PROJECT_URL: 'Env.schema.string()',
      SUPABASE_API_KEY: 'Env.schema.string()',
    },
  })
}

const configureAuth = async (command: ConfigureCommand, codemods: Codemods) => {
  const project = await codemods.getTsMorphProject()
  if (!project) {
    command.logger.error(
      'Unable to update the adonis auth configuration: Invalid project for TsMorph'
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const file = findAuthConfig(project)
  if (!file) {
    command.logger.error(
      'Unable to update the adonis auth configuration: Unable to find config/auth.ts in path'
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const authConfigVariable = file.getVariableDeclaration('authConfig')
  if (!authConfigVariable) {
    command.logger.error(
      'Unable to update the adonis auth configuration: Unable to find authConfig variable'
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const initializer = authConfigVariable.getInitializerIfKind(SyntaxKind.CallExpression)
  if (!initializer) {
    command.logger.error(
      'Unable to update the adonis auth configuration: Unable to get the initializer of authConfig'
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const configObject = initializer.getArguments()[0].asKind(SyntaxKind.ObjectLiteralExpression) // defineConfig object
  if (!configObject) {
    command.logger.error(
      "Unable to update the adonis auth configuration: Invalid 'authConfig' type, defineConfig({...}) needed"
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const guardsProperty = configObject.getProperty('guards')
  if (!guardsProperty) {
    command.logger.error(
      "Unable to update the adonis auth configuration: Unable to find 'guards' property"
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  const defaultProperty = configObject.getProperty('default')
  if (!defaultProperty) {
    command.logger.error(
      "Unable to update the adonis auth configuration: Unable to find 'default' property"
    )
    showManualModification(command)
    throw new ConfigureAuthConfigException()
  }

  // set the supabase guard as default
  defaultProperty.replaceWithText(`default: 'supabase'`)

  // add the supabase guard
  const guardsObject = guardsProperty
    .asKindOrThrow(SyntaxKind.PropertyAssignment)
    .getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)
  guardsObject.addPropertyAssignment({
    name: 'supabase',
    initializer: `(ctx) => new SupabaseJwtGuard(ctx)`,
  })

  // add the import for the supabase guard
  file.addImportDeclaration({
    namedImports: ['SupabaseJwtGuard'],
    moduleSpecifier: '../app/auth/guards/supabase_jwt_guard.js',
  })

  await file.save()
  command.logger.log('\x1b[32mDONE:\x1b[0m    modified adonisjs/auth configuration')
}

// project.getSourceFile('config/auth.ts') don't work in japa tests..
const findAuthConfig = (
  project: InstanceType<
    typeof import('@adonisjs/assembler/code_transformer').CodeTransformer
  >['project']
) => {
  return project
    .getSourceFiles()
    .find((projectFile) => projectFile.getFilePath().includes('config/auth.ts'))
}

const showManualModification = (command: ConfigureCommand) => {
  command.logger.warning('')
  command.logger.warning('Modification of the adonisjs/auth configuration file failed.')
  command.logger.warning('You need to make the change manually, which is easy.')
  command.logger.warning('Instructions can be found here: [TODO]')
  command.logger.warning('')
}
