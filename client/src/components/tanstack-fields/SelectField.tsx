import { useStore } from '@tanstack/react-form';

import { useFieldContext } from '@/hooks/form-context';

import { Field, FieldError } from '../ui/Field';
import { Label } from '../ui/Label';
import { Select, SelectOption } from '../ui/Select';

function SelectField({
  label,
  options,
  placeholder,
}: {
  label: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();

  const { errors, isTouched } = useStore(field.store, state => state.meta);

  return (
    <Field>
      <Label>{label}</Label>
      <Select
        value={field.state.value}
        onChange={e => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
      >
        {placeholder && (
          <SelectOption
            value=""
            disabled
          >
            {placeholder}
          </SelectOption>
        )}
        {options.map(option => (
          <SelectOption
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectOption>
        ))}
      </Select>
      <FieldError errors={isTouched ? errors.map(message => ({ message })) : undefined} />
    </Field>
  );
}

export { SelectField };
