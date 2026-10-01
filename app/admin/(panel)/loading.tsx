export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className="skeleton mb-8 h-9 w-56" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-36 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton mt-8 h-80 rounded-2xl" />
    </div>
  );
}
