'use client';

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-200" />
      <CardSkeleton />
      <TableSkeleton />
    </div>
  );
}
