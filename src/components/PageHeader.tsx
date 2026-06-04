interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border pb-6">
      <h1 className="font-display text-4xl uppercase tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-text-muted">
          {subtitle}
        </p>
      )}
    </header>
  );
}
