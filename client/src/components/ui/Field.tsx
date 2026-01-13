import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

const fieldVariants = cva('group/field flex w-full gap-2', {
  variants: {
    orientation: {
      vertical: 'flex-col *:w-full',
      horizontal: 'flex-row items-center',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

// The core wrapper for a single field. Provides orientation control, invalid state styling, and spacing.
function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

// Label styled for both direct inputs and nested Field children.
function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="field-label"
      className={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

// Layout wrapper that stacks Field components and enables container queries for responsive orientations.
function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-7 *:data-[slot=field-group]:gap-4',
        className,
      )}
      {...props}
    />
  );
}

// Flex column that groups control and descriptions when the label sits beside the control. Not required if you have no description.
function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'group/field-content flex flex-1 flex-col gap-1.5 leading-snug',
        className,
      )}
      {...props}
    />
  );
}

// Helper text slot that automatically balances long lines in horizontal layouts.
function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-muted-foreground text-sm leading-normal font-normal',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

// Accessible error container that accepts children or an errors array (e.g., from react-hook-form).
function FieldError({
  className,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<string | undefined>;
}) {
  const content = React.useMemo(() => {
    const messages = (errors ?? []).filter((m): m is string => !!m);

    if (!messages.length) return null;

    const uniqueMessages = [...new Set(messages)];

    if (uniqueMessages.length === 1) {
      return uniqueMessages[0];
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueMessages.map(message => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    );
  }, [errors]);

  if (!content) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      data-slot="field-error"
      className={cn('text-destructive text-sm font-normal', className)}
      {...props}
    >
      {content}
    </div>
  );
}

export { Field, FieldLabel, FieldGroup, FieldContent, FieldDescription, FieldError };
