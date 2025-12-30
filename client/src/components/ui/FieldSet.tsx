import * as React from 'react';

import { cn } from '@/lib/cn';

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn('flex flex-col gap-6', className)}
      {...props}
    />
  );
}

function Legend({ className, ...props }: React.ComponentProps<'legend'>) {
  return (
    <legend
      data-slot="field-legend"
      className={cn('mb-3 font-medium', className)}
      {...props}
    />
  );
}

export { FieldSet, Legend };
