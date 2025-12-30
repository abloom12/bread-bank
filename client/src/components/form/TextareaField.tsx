import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

function TextareaField({
  label,
  placeholder,
  rows,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
}) {
  const field = useFieldContext<string>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  return (
    <Field>
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        value={field.state.value}
        placeholder={placeholder}
        rows={rows}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      <FieldError errors={isTouched ? errors : undefined} />
    </Field>
  );
}

export { TextareaField };
