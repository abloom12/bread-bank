import { z } from 'zod';

import { useAppForm } from '@/hooks/form';
import { authClient } from '@/lib/auth-client';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    } as z.infer<typeof loginSchema>,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      // TODO: handle errors
      await authClient.signIn.email({ ...value, callbackURL: '/' });
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
        name="email"
        children={field => <field.InputField label="email" />}
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
      <form.AppForm>
        <form.SubmitButton label="submit" />
      </form.AppForm>
    </form>
  );
}
