import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/cn';

import { Label } from './Label';

const fieldVariants = cva(
  'group/field data-[invalid=true]:text-destructive flex w-full gap-2',
  {
    variants: {
      orientation: {
        vertical: 'flex-col *:w-full',
        horizontal: [
          'flex-row items-center',
          '*:data-[slot=field-label]:flex-auto',
          'has-[>[data-slot=field-content]]:items-start',
          'has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        ],
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
);

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
    <Label
      data-slot="field-label"
      className={cn(
        'group/field-label peer/field-label',
        'flex w-fit gap-2 text-sm leading-snug font-medium',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        'group-data-[disabled=true]/field:opacity-50',
        '*:data-[slot=field]:p-2',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border',
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
        'group/field-group @container/field-group',
        'flex w-full flex-col gap-5',
        '*:data-[slot=field-group]:gap-4',
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
        'group/field-content',
        'flex flex-1 flex-col gap-0.5 leading-snug',
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
        'text-muted-foreground text-left text-xs/relaxed leading-normal font-normal',
        'group-has-data-[orientation=horizontal]/field:text-balance',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  );
}

// Accessible error container that accepts children or an errors array (from TanStack Form + Zod).
function FieldError({
  className,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<string | { message: string } | undefined>;
}) {
  const content = React.useMemo(() => {
    console.log(errors);
    const messages = (errors ?? [])
      .map(m => (typeof m === 'object' && m !== null ? m.message : m))
      .filter((m): m is string => !!m);

    console.log(messages);

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
