import Link from "next/link";
import { CiUser } from "react-icons/ci";
import { FaRegCopyright } from "react-icons/fa";
import { IoHomeOutline, IoMailUnread } from "react-icons/io5";

const links = [
  {
    icon: IoHomeOutline,
    href: '/',
    label: "Home"
  },
  {
    icon: CiUser,
    href: '/about',
    label: "About"
  },
  {
    icon: IoMailUnread,
    href: '/kontak',
    label: "Kontak"
  },
]

function Footer() {
  return (
    <div className="flex flex-col relative">
      <ul className="flex px-2 gap-3 justify-center items-center flex-wrap bg-blue-500 py-5 !mb-0">
        {links.map(link => <Link key={link.label} href={link.href} className="flex gap-1 items-center justify-center text-slate-50">
          <link.icon />
          {link.label}
        </Link>)}
      </ul>

      <div
        className="bg-blue-800 flex flex-col md:flex-row justify-between items-center flex-wrap gap-3 text-white py-5 px-3 text-xs lg:text-base
      "
      >
        <div className="flex h-full gap-1 items-center">
          Copyright
          <FaRegCopyright /> 2025 Toserbanet.com
        </div>
        <div className="flex h-full gap-2 items-center">
          Made by Toserbanet Team
        </div>
      </div>
    </div>
  );
}

export default Footer;
