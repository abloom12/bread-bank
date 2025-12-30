import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

function TextareaField({ label }: { label: string }) {
  const field = useFieldContext<string>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  return (
    <Field>
      <Label>{label}</Label>
      <Textarea
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={isTouched ? errors.map(message => ({ message })) : undefined} />
    </Field>
  );
}

export { TextareaField };
