import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

function NumberField({ label }: { label: string }) {
  const field = useFieldContext<number>();
  const { errors, isTouched } = useStore(field.store, state => state.meta);

  const errorId = `${field.name}-error`;
  const hasErrors = isTouched && errors.length > 0;

  return (
    <Field>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        type="number"
        id={field.name}
        value={field.state.value}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        onChange={e => field.handleChange(e.target.valueAsNumber)}
        onBlur={field.handleBlur}
      />
      <FieldError
        id={errorId}
        errors={isTouched ? errors : undefined}
      />
    </Field>
  );
}

export { NumberField };
