# With details, internal profile and role based version

This version combining the 2 samples details and internal profile, adding a decorator to build a role access based application.

## Code modifications

Modifications to the 2 versions have been applied: [details](../with-custom-details/README.md) and [internal profile](../with-internal-profile/README.md)

Add a decorator `app/decorators/roles.ts` to specify a specific role for a route (`@Roles('Admin')`)

Migration to a controller (`app/controllers/users_controller.ts`) and add a new secure route

Add 2 tests in `tests/functional/auth.sec.ts` to test the decorator
## Note
Here, a simple version has been implemented, the class architecture can be modified to match your needs