import * as React from 'react';
import { cn } from '@/lib/cn';

function Checkbox({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(className)}
      {...props}
    />
  );
}

export { Checkbox };
