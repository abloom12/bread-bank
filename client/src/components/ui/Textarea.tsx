import * as React from 'react';
import { cn } from '@/lib/cn';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn('border-input', className)}
      {...props}
    />
  );
}

export { Textarea };
