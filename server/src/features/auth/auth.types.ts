export type OAuthProvider = 'google' | 'apple';

export type OAuthProfile = {
  provider: OAuthProvider;
  providerUserId: string;
  email: string | null;
  name: string | null;
};

export type User = {
  id: string;
  email: string | null;
  name: string | null;
};
