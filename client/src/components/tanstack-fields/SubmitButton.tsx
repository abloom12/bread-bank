import { useFormContext } from '@/hooks/form-context';

function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={state => state.isSubmitting}>
      {isSubmitting => <button disabled={isSubmitting}>{label}</button>}
    </form.Subscribe>
  );
}

export { SubscribeButton };
