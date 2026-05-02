export default function DashboardLoading() {
  return (
    <div className="p-6 flex gap-5 h-full animate-pulse">
      {/* FX panel skeleton */}
      <div className="flex-1 bg-panel rounded-2xl p-6 flex flex-col gap-6">
        {/* Filter tabs */}
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-neutral-100 rounded-full" />
          <div className="h-8 w-20 bg-neutral-100 rounded-full" />
          <div className="h-8 w-20 bg-neutral-100 rounded-full" />
        </div>
        {/* Balance */}
        <div>
          <div className="h-4 w-28 bg-neutral-100 rounded mb-3" />
          <div className="h-10 w-52 bg-neutral-100 rounded" />
        </div>
        {/* Actions */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 w-24 bg-neutral-100 rounded-xl" />
          ))}
        </div>
        {/* Transaction list */}
        <div className="flex flex-col gap-3 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 w-36 bg-neutral-100 rounded mb-2" />
                <div className="h-3 w-24 bg-neutral-100 rounded" />
              </div>
              <div className="h-4 w-14 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Cards panel skeleton */}
      <div className="w-80 bg-panel rounded-2xl p-6 flex flex-col gap-5">
        <div className="h-5 w-12 bg-neutral-100 rounded" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-32 bg-neutral-100 rounded-2xl" />
          <div className="h-32 bg-neutral-100 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-100 rounded-full shrink-0" />
              <div className="flex-1">
                <div className="h-3.5 w-28 bg-neutral-100 rounded mb-2" />
                <div className="h-3 w-20 bg-neutral-100 rounded" />
              </div>
              <div className="h-4 w-12 bg-neutral-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
