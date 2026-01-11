import * as React from 'react';
import { cn } from '@/lib/cn';

function Input({ type, className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border bg-transparent text-base outline-none',
        'h-9 w-full min-w-0 rounded-md px-3 py-1',
        'transition-colors',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
