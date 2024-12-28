import Profile from '#models/profile'
import { User } from '@supabase/supabase-js'

const getOrCreateProfile = async (user: User): Promise<Profile> => {
  let profile = await Profile.find(user.id)

  if (!profile) {
    profile = await Profile.create({
      id: user.id,
      fullName: user.email ?? 'NAME-ERROR',
      email: user.email ?? 'MAIL-ERROR',
    })
  }

  return profile
}

export { getOrCreateProfile }
