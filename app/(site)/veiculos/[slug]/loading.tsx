export default function Loading() {
  return (
    <div className="container py-8" aria-busy="true" aria-label="Carregando veículo">
      <div className="skeleton mb-4 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 space-y-3">
          <div className="skeleton aspect-[16/10] rounded-2xl" />
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[4/3] w-24 rounded-lg" />
            ))}
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
