import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm whitespace-nowrap uppercase transition-all outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:shrink-0 [&>svg]:pointer-events-none [&>svg]:size-4',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-white',
        outline: '',
        ghost: '',
        link: 'text-primary lowercase underline-offset-4 hover:underline',
      },
      size: {
        'default': 'h-9 px-4',
        'sm': 'h-8 px-3',
        'lg': 'h-10 px-6',
        'icon': 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
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

// shadcn ui styles
// --------------------------------
// font-medium
// focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]
// aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive

export { Button };
