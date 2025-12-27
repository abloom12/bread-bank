import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/components/ui/Button';
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/ButtonGroup';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectOption } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Separator } from '@/components/ui/Separator';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldContent,
} from '@/components/ui/Field';

export const Route = createFileRoute('/components')({
  component: ComponentsShowcase,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b pb-2">{title}</h2>
      {children}
    </section>
  );
}

function ComponentsShowcase() {
  return (
    <div className="container mx-auto p-8 space-y-12 max-w-4xl">
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
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">I</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="ButtonGroup">
        <div className="space-y-4">
          <ButtonGroup orientation="horizontal">
            <Button>Left</Button>
            <ButtonGroupSeparator />
            <Button>Center</Button>
            <ButtonGroupSeparator />
            <Button>Right</Button>
          </ButtonGroup>
          <ButtonGroup orientation="horizontal">
            <ButtonGroupText>Label</ButtonGroupText>
            <ButtonGroupSeparator />
            <Button>Action</Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button>Top</Button>
            <ButtonGroupSeparator orientation="horizontal" />
            <Button>Bottom</Button>
          </ButtonGroup>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-4">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Input">
        <div className="space-y-4 max-w-sm">
          <Input placeholder="Default input" />
          <Input type="email" placeholder="Email input" />
          <Input type="password" placeholder="Password input" />
          <Input disabled placeholder="Disabled input" />
        </div>
      </Section>

      <Section title="Textarea">
        <div className="max-w-sm">
          <Textarea placeholder="Enter some text..." rows={4} />
        </div>
      </Section>

      <Section title="Select">
        <div className="max-w-sm">
          <Select defaultValue="">
            <SelectOption value="" disabled>
              Select an option
            </SelectOption>
            <SelectOption value="option1">Option 1</SelectOption>
            <SelectOption value="option2">Option 2</SelectOption>
            <SelectOption value="option3">Option 3</SelectOption>
          </Select>
        </div>
      </Section>

      <Section title="Label">
        <div className="space-y-4">
          <Label>Default Label</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="example-input">Label for input:</Label>
            <Input id="example-input" placeholder="Associated input" />
          </div>
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

      <Section title="Separator">
        <div className="space-y-4">
          <p>Horizontal separator:</p>
          <Separator orientation="horizontal" />
          <p>Vertical separator (in flex container):</p>
          <div className="flex h-8 items-center gap-4">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </div>
      </Section>

      <Section title="Field">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="field-input">Username</FieldLabel>
            <FieldContent>
              <Input id="field-input" placeholder="Enter username" />
              <FieldDescription>This will be your public display name.</FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="field-email">Email</FieldLabel>
            <FieldContent>
              <Input id="field-email" type="email" placeholder="Enter email" />
              <FieldError>Please enter a valid email address.</FieldError>
            </FieldContent>
          </Field>

          <Field data-disabled="true">
            <FieldLabel htmlFor="field-disabled">Disabled Field</FieldLabel>
            <FieldContent>
              <Input id="field-disabled" disabled placeholder="Disabled" />
              <FieldDescription>This field is disabled.</FieldDescription>
            </FieldContent>
          </Field>
        </FieldGroup>
      </Section>
    </div>
  );
}
