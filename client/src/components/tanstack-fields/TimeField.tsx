import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

function TimeField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  return (
    <Field>
      <Label>{label}</Label>
      <Input
        type="time"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={isTouched ? errors.map(message => ({ message })) : undefined} />
    </Field>
  );
}

export { TimeField };
