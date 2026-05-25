import {
  Sheet as ShadSheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Sheet({
  button,
  children,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
  className = "",
  open,
  onOpenChange,
}: {
  button: React.ReactNode;
  children?: React.ReactNode;
  description?: string;
  title?: string;
  className?: string;
  open?: boolean;
  onOpenChange?: () => void;
}) {
  return (
    <ShadSheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger>{button}</SheetTrigger>
      <SheetContent className={`${className}`}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </ShadSheet>
  );
}

export default Sheet;
