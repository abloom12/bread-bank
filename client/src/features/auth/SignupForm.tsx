import { z } from 'zod';

import { useAppForm } from '@/hooks/form';
import { authClient } from '@/lib/auth-client';

const signupSchema = z
  .object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8).max(32),
    confirmPassword: z.string().min(8).max(32),
    image: z.string().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignupForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      image: '',
    } as z.infer<typeof signupSchema>,
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      const { confirmPassword, ...rest } = value;
      await authClient.signUp.email({ ...rest, callbackURL: '/' });
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
      <form.AppField
        name="name"
        children={field => <field.InputField label="name" />}
      />
      <form.AppField
        name="email"
        children={field => (
          <field.InputField
            label="email"
            type="email"
          />
        )}
      />
      <form.AppField
        name="password"
        children={field => (
          <field.InputField
            label="password"
            type="password"
          />
        )}
      />
      <form.AppField
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
        children={field => (
          <field.InputField
            label="confirm password"
            type="password"
          />
        )}
      />
      <form.AppForm>
        <form.SubmitButton label="submit" />
      </form.AppForm>
    </form>
  );
}
