import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .refine(
    password => {
      if (!password) return true;

      const lengthOk = password.length >= 8 && password.length <= 128;
      const noSpaces = /^\S+$/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      return lengthOk && noSpaces && hasUpper && hasLower && hasNumber && hasSpecial;
    },
    {
      message:
        'Password must be at least 8 characters, include upper and lower case letters, a number, a special character, and contain no spaces.',
    },
  );

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .refine(v => (v ? z.email().safeParse(v).success : true), {
        message: 'Invalid email address',
      }),
    password: passwordSchema,
    confirm: z.string(),
    image: z.string().optional(),
  })
  .refine(({ password, confirm }) => !password || !!confirm, {
    message: 'Please confirm your password.',
    path: ['confirm'],
  })
  .refine(({ password, confirm }) => !password || !confirm || password === confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export { signupSchema };
