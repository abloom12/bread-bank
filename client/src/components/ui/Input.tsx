import * as React from 'react';
import { cn } from '@/lib/cn';

function Input({ type, className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn('h-9', className)}
      {...props}
    />
  );
}

export { Input };
