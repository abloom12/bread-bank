import { OAuthProfile, User } from './auth.types';

const users = new Map<string, User>();
const oauthAccounts = new Map<string, { userId: string }>(); // provider:providerUserId -> userId

export async function findOrCreateUserFromOAuth(profile: OAuthProfile): Promise<User> {
  const key = `${profile.provider}:${profile.providerUserId}`;
  const existing = oauthAccounts.get(key);

  if (existing) {
    const u = users.get(existing.userId);
    if (!u) throw new Error('OAuth account mapped to missing user');
    return u;
  }

  const user: User = {
    id: crypto.randomUUID(),
    email: profile.email,
    name: profile.name,
  };

  users.set(user.id, user);
  oauthAccounts.set(key, { userId: user.id });
  return user;
}

export async function getMe(userId: string): Promise<User> {
  const u = users.get(userId);
  if (!u) throw new Error('User not found');
  return u;
}
