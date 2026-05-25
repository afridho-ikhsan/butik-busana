import { cn } from "@/utils/cn";

function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center backdrop-blur-sm h-[80vh] bg-slate-50/50",
        className
      )}
    >
      <div className="loader"></div>
    </div>
  );
}

export default Loader;
