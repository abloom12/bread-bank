import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/Button';
import { Field, FieldGroup, FieldDescription } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export const Route = createFileRoute('/components')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Form UI</h2>

      <form className="max-w-md">
        <FieldGroup>
          <Field>
            <Label>Name</Label>
            <Input placeholder="Enter your name" />
          </Field>
          <Field>
            <Label>Username</Label>
            <FieldDescription>
              Choose a unique username for your account.
            </FieldDescription>
            <Input placeholder="Enter your username" />
          </Field>
          <Field>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
            />
          </Field>
          <Field>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
            />
          </Field>
          <Field>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm your password"
            />
            <FieldDescription>Must match the password entered above.</FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
