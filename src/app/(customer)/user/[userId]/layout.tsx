import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { TbNotes } from "react-icons/tb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  const userSlug = (session?.user as { slug?: string })?.slug || userId;

  return (
    <div className="grid grid-cols-12 relative gap-x-2">
      <aside className="rounded-r-lg bg-slate-50/50 hidden lg:flex flex-col justify-between items-center shadow sticky top-0 col-span-2">
        <div className="w-full flex flex-col gap-2 items-center">
          <Link
            className="w-full p-7 transition-all hover:bg-slate-200 flex gap-2 items-center"
            href={`/user/${userSlug}`}
          >
            <CgProfile className="text-xl" /> Profil
          </Link>
          <Link
            className="w-full p-7 transition-all hover:bg-slate-200 flex gap-2 items-center"
            href={`/user/${userSlug}/transactions`}
          >
            <TbNotes className="text-xl" /> Transaksi
          </Link>
          <LogoutButton className="p-5 w-full" />
        </div>
      </aside>

      <div className="col-start-1 lg:col-start-3 col-span-12 lg:col-span-12 min-h-[80vh] relative">
        {children}
      </div>
    </div>
  );
}

export default UserLayout;
