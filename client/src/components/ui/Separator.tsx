import * as React from 'react';
import { cn } from '@/lib/cn';

function Separator({
  className,
  decorative = true,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}) {
  return (
    <div
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : orientation}
      role={decorative ? undefined : 'separator'}
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        'shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
