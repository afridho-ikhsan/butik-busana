import { IoReturnDownBackOutline } from "react-icons/io5";
import NotFoundInfo from "@/components/not-found-info";
import PrimaryButton from "@/components/primary-button";
import Link from "next/link";

function NotFound() {
  return (
    <div className="h-[70vh]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <NotFoundInfo
          description="Anda berada di luar jangkauan, pastikan anda url yang anda masukkan sudah sesuai"
          object="Halaman"
        >
          <Link href={"/"} className="inline-block mx-auto mt-5">
            <PrimaryButton>
              <span>Kembali</span>
              <IoReturnDownBackOutline className="text-xl" />
            </PrimaryButton>
          </Link>
        </NotFoundInfo>
      </div>
    </div>
  );
}

export default NotFound;
