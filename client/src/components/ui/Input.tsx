import * as React from 'react';
import { cn } from '@/lib/cn';

function Input({ type, className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border bg-transparent shadow-xs transition-colors outline-none',
        'h-9 w-full min-w-0 rounded-md px-3 py-1 text-base',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm',
        'placeholder:text-muted-foreground selection:bg-primary',
        className,
      )}
      {...props}
    />
  );
}

// shadcn ui styles
// --------------------------------

// USING:
// h-9 w-full min-w-0 rounded-md
// border bg-transparent px-3 py-1 text-base shadow-xs
// transition-[color,box-shadow] outline-none
// file:text-foreground file:bg-transparent file:text-sm file:inline-flex
// file:h-7 file:border-0
// placeholder:text-muted-foreground

// NOT USING:
// dark:bg-input/30
// border-input md:text-sm
// disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
// file:font-medium
// selection:bg-primary selection:text-primary-foreground
// focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
// aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive

export { Input };
