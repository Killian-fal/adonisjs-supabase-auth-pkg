# With internal profile version

In this section, we'll add a local extension to our **user supabase**. Here, it will be via the `Profile` model

Sqlite is used, to launch migrations run `node ace migration:run`

## Code modifications

In `config/auth.ts`, the guard `api` has been deleted

Added model `app/models/profile.ts` and its migration

Added service `app/services/profiles_service.ts`

In `app/auth/guards/supabase_jwt_guard.ts`, the field `profile: Profile` has been added to the CustomSupabaseUser interface

In `app/auth/guards/supabase_jwt_guard.ts`, the field `profile: await getOrCreateProfile(user)` has been added to the buildCustomSupabaseUser and testingAuthenticate return

In `start/routes.ts`, the field `name: user.profile.fullName` has been added to the response (the test has also been modified)

Add a test in `tests/functional/auth.sec.ts`

## Note
Here, a simple version has been implemented, the class architecture can be modified to match your needs