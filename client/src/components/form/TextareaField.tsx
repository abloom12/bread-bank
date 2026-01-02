import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldDescription, FieldError } from '../ui/Field';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

type TextareaProps = {
  label: string;
  placeholder?: string;
  rows?: number;
  description?: string;
};

function TextareaField({ label, placeholder, rows, description }: TextareaProps) {
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
      <Textarea
        id={field.name}
        value={field.state.value}
        placeholder={placeholder}
        rows={rows}
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

export { TextareaField };
