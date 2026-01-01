import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export const Route = createFileRoute('/_app/components')({
  component: ComponentsShowcase,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="border-b pb-2 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function ComponentsShowcase() {
  return (
    <div className="container mx-auto max-w-4xl space-y-12 p-8">
      <h1 className="text-3xl font-bold">UI Components</h1>

      <Section title="Button">
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">I</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section title="Spinner">
        <div className="flex items-center gap-4">
          <Spinner />
          <Spinner className="size-6" />
          <Spinner className="size-8" />
          <Button disabled>
            <Spinner className="mr-2" />
            Loading...
          </Button>
        </div>
      </Section>
    </div>
  );
}
