import * as React from 'react';
import { cn } from '@/lib/cn';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-colors outline-none',
        className,
      )}
      {...props}
    />
  );
}

// shadcn ui styles
// --------------------------------
// USING:
// flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs

// NOT USED:
// border-input
// placeholder:text-muted-foreground
// focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
// aria-invalid:ring-destructive/20 aria-invalid:border-destructive
// dark:aria-invalid:ring-destructive/40 dark:bg-input/30
// transition-[color,box-shadow] outline-none md:text-sm
// disabled:cursor-not-allowed disabled:opacity-50
export { Textarea };
