import { z } from 'zod';

import { useAppForm } from '@/hooks/form';
import { authClient } from '@/lib/auth-client';

import { FieldGroup } from '@/components/ui/Field';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/^\S+$/, 'Password must not contain spaces')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: passwordSchema,
  confirmPassword: passwordSchema,
  image: z.string().optional(),
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...reqBody } = value;

      const a = authClient.useSession();

      const { data, error } = await authClient.signUp.email(
        { ...reqBody, callbackURL: '/' },
        {
          onRequest: ctx => {
            // show loading
          },
          onSuccess: ctx => {
            // redirect to to dashboard or sign in page
          },
          onError: ctx => {
            // show error message
          },
        },
      );

      console.log({ data, error });
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
      <FieldGroup>
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
      </FieldGroup>

      <form.AppForm>
        <form.SubmitButton label="submit" />
      </form.AppForm>
    </form>
  );
}
