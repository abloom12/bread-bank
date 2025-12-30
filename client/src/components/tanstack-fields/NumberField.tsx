import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  return (
    <Field>
      <Label>{label}</Label>
      <Input
        type="number"
        value={field.state.value}
        onChange={e => field.handleChange(e.target.valueAsNumber)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={isTouched ? errors.map(message => ({ message })) : undefined} />
    </Field>
  );
}

export { NumberField };
