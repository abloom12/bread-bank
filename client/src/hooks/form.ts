import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from './form-context';

import { CheckboxField } from '@/components/form/CheckboxField';
import { InputField } from '@/components/form/InputField';
import { NumberField } from '@/components/form/NumberField';
import { SelectField } from '@/components/form/SelectField';
import { TextareaField } from '@/components/form/TextareaField';
import { SubmitButton } from '@/components/form/SubmitButton';

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    CheckboxField,
    InputField,
    NumberField,
    SelectField,
    TextareaField,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});
