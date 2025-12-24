// import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { authClient } from '@/lib/auth-client';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8).max(32),
  image: z.string().optional(),
  callbackURL: z.string().optional(),
});

type SignupSchema = z.infer<typeof signupSchema>;

export function SignupForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      image: '',
      callbackURL: '',
    } as SignupSchema,
    validators: {
      onChange: signupSchema,
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email({ ...value });
    },
  });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        children={field => (
          <>
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={e => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <em role="alert">{field.state.meta.errors.join(', ')}</em>
            )}
          </>
        )}
      />
    </form>
  );
}
