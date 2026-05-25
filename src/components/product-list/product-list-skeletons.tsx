import { Skeleton } from "../ui/skeleton";

function ProductListSkeletons() {
  return (
    <div className="mt-3 grid max-[315px]:grid-cols-1 max-lg:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 place-items-center gap-x-2 md:gap-x-5 gap-y-5 container mx-auto px-2">
      {Array.from({ length: 18 }).map((_, i) => (
        <Skeleton
          className="h-[15rem] w-full rounded-lg bg-slate-300/50 shrink-0"
          key={i}
        />
      ))}
    </div>
  );
}

export default ProductListSkeletons;
