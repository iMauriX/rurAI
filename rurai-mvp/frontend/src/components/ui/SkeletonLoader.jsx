export const SkeletonLoader = () => {
  return (
    <div className="animate-pulse flex flex-col space-y-4 max-w-md mx-auto p-4 border rounded-lg bg-white shadow">
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="h-32 bg-slate-200 rounded w-full"></div>
      <div className="flex justify-between">
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
        <div className="h-10 bg-slate-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};
