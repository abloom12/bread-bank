import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldDescription, FieldError } from '../ui/Field';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'date'
  | 'time'
  | 'tel'
  | 'url'
  | 'search';

function InputField({
  type = 'text',
  label,
  description,
}: {
  type?: InputType;
  label: string;
  description?: string;
}) {
  const field = useFieldContext<string>();
  const { errors, isTouched } = useStore(field.store, state => state.meta);

  const descriptionId = `${field.name}-description`;
  const errorId = `${field.name}-error`;
  const hasErrors = isTouched && errors.length > 0;

  const describedBy =
    `${description ? descriptionId : ''} ${hasErrors ? errorId : ''}`.trim() || undefined;

  return (
    <Field>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        type={type}
        id={field.name}
        value={field.state.value}
        aria-invalid={hasErrors}
        aria-describedby={describedBy}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      />
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      <FieldError
        id={errorId}
        errors={isTouched ? errors : undefined}
      />
    </Field>
  );
}

export { InputField };
