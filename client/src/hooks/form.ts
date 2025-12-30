import { createFormHook } from '@tanstack/react-form';
// import { lazy } from 'react';
import { fieldContext, formContext } from './form-context.tsx';

//const TextField = lazy(() => import('../components/text-fields.tsx'))

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldComponents: {
    // TextField,
  },
  formComponents: {
    // SubscribeButton,
  },
  fieldContext,
  formContext,
});
