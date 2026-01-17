import { z } from 'zod';

import { useAppForm } from '@/hooks/form';
import { authClient } from '@/lib/auth-client';

import { Field, FieldGroup } from '@/components/ui/Field';
import { signupSchema } from './signup.schema';

export function SignupForm() {
  const form = useAppForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm: '',
      image: '',
    } as z.infer<typeof signupSchema>,
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm, ...reqBody } = value;

      // const a = authClient.useSession();

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
          name="confirm"
          children={field => (
            <field.InputField
              label="confirm password"
              type="password"
            />
          )}
        />

        <form.AppForm>
          <Field>
            <form.SubmitButton label="submit" />
          </Field>
        </form.AppForm>
      </FieldGroup>
    </form>
  );
}
