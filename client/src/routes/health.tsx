import { createFileRoute } from '@tanstack/react-router';
import { HealthPage } from '@/features/health/health';

export const Route = createFileRoute('/health')({
  component: HealthPage,
});
