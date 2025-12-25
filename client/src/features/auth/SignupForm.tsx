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

const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(8).max(32),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      image: '',
      callbackURL: '',
    } as z.infer<typeof signupFormSchema>,
    validators: {
      onChange: signupFormSchema,
      onSubmit: signupFormSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, ...rest } = value;
      await authClient.signUp.email({ ...rest });
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
        name="password"
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
      <form.Field
        name="confirmPassword"
        validators={{
          onChangeListenTo: ['password'],
          onChange: ({ value, fieldApi }) => {
            if (value !== fieldApi.form.getFieldValue('password')) {
              return 'Passwords do not match';
            }
            return undefined;
          },
        }}
      >
        {field => (
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
      </form.Field>
    </form>
  );
}
