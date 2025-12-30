import * as React from 'react';
import { cn } from '@/lib/cn';

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'border bg-transparent text-base outline-none',
        'h-9 w-full min-w-0 rounded-md px-3 py-1',
        'transition-color',
        className,
      )}
      {...props}
    />
  );
}

function SelectOption({ ...props }: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot="select-option"
      {...props}
    />
  );
}

function SelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot="select-optgroup"
      className={cn(className)}
      {...props}
    />
  );
}

export { Select, SelectOption, SelectOptGroup };
