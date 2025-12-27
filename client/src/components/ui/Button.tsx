import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        destructive: '',
        outline: '',
        ghost: '',
        link: '',
      },
      size: {
        'default': 'h-9',
        'sm': 'h-8',
        'lg': 'h-10',
        'icon': 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function Button({
  size = 'default',
  variant = 'default',
  className,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ size, variant }), className)}
      {...props}
    />
  );
}

export { Button };
