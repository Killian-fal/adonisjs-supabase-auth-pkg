# With details version

In this section, we use [supabase hook](https://supabase.com/docs/guides/auth/auth-hooks) to insert elements into the access token. Here, we insert a role

```sql
-- Create the auth hook function
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role varchar;
    details jsonb;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

    claims := event->'claims';

    details := jsonb_build_object('role', user_role);
    claims := jsonb_set(claims, '{details}', to_jsonb(details));

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;
```

This code will be executed at login / refresh token by supabase to add the role to the access token

## Code modifications

In `app/auth/guards/supabase_jwt_guard.ts`, the field `role: string | null` has been added to the CustomSupabaseUserDetails interface

In `start/routes.ts`, the field `role: user.details.role` has been added to the response (the test has also been modified)

In `config/auth.ts`, the guard `api` has been deleted

## Note

Here, a simple version has been implemented, the class architecture can be modified to match your needs
