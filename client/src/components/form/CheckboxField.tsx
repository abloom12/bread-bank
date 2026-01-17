import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldDescription, FieldError } from '../ui/Field';
import { Checkbox } from '../ui/Checkbox';
import { Label } from '../ui/Label';

type CheckboxFieldProps = {
  label: string;
  description?: string;
};

function CheckboxField({ label, description }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  const descriptionId = `${field.name}-description`;
  const errorId = `${field.name}-error`;
  const hasErrors = isTouched && errors.length > 0;

  const describedBy =
    `${description ? descriptionId : ''} ${hasErrors ? errorId : ''}`.trim() || undefined;

  return (
    <Field orientation="horizontal">
      <Checkbox
        id={field.name}
        checked={field.state.value}
        aria-invalid={hasErrors}
        aria-describedby={describedBy}
        onChange={e => field.handleChange(e.target.checked)}
        onBlur={field.handleBlur}
      />
      <Label htmlFor={field.name}>{label}</Label>
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

export { CheckboxField };
