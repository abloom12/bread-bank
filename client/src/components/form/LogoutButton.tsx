import { useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/lib/query-keys';

type LogoutButtonProps = Omit<React.ComponentProps<typeof Button>, 'onClick'>;

function LogoutButton({ children = 'Log out', ...props }: LogoutButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.auth.session });
      router.navigate({ to: '/login' });
    },
  });

  return (
    <Button
      onClick={() => logout.mutate()}
      disabled={logout.isPending}
      {...props}
    >
      {logout.isPending ? 'Logging out...' : children}
    </Button>
  );
}

export { LogoutButton };
