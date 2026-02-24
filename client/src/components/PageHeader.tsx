interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="swiss-accent-lg" />
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground ml-8">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
