### TODOS

- Focus ring styles for keyboard navigation (input, textarea, select)
- Error state styling support (input, textarea, select)
- Consider enforcing stronger requirements and adding password strength indicator during signup
- check out have i been powned plugin from better-auth
- use shared/auth.ts values in client/ and server/
- setup vite .env file and make sure auth-client.ts baseURL is not hardcoded, we will also add .evn varaibles for the target in server/src/lib/auth.ts.

### Security

Do not leak info to potential hackers during login/singup.

Bad error messages:

- Login: "No account found with this email" → attacker learns email doesn't exist
- Login: "Incorrect password" → attacker learns email DOES exist
- Signup: "Email already registered" → confirms email exists

Good error messages:

- Login: "Invalid email or password" → no info leaked
- Password reset: "If an account exists, you'll receive a reset link" → no info leaked

# Prompt

I want you to go through my client code (inside client/ folder) and look for things we could add, this is a starter kit for my future projects so the more boilerplate stuff I can setup now the better. Once you are done please

save your review/plan in docs/code-review3.md

during this please ignore styling stuff as I know that needs work.
