import { useFormContext } from '@/hooks/form-context';

import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={state => state.isSubmitting}>
      {isSubmitting => (
        <Button
          type="submit"
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner className="size-4" />}
          {isSubmitting ? (loadingLabel ?? label) : label}
        </Button>
      )}
    </form.Subscribe>
  );
}

export { SubmitButton };
