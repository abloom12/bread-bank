import * as React from 'react';
import { cn } from '@/lib/cn';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn('h-9', className)}
      {...props}
    />
  );
}

export { Label };
