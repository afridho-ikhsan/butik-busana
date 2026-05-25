import Image from "next/image";
import NotFoundIcon from "@/assets/nothing.svg";

function NotFoundInfo({
  description,
  object,
  customTitle,
  customIconUrl,
  children,
}: {
  customTitle?: string;
  object: string;
  description: string;
  customIconUrl?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-5 flex flex-col justify-center items-center gap-3 min-h-[30rem] h-full w-full">
      <Image
        src={customIconUrl || NotFoundIcon}
        alt={`${object} is not found`}
        className="w-24 h-24"
        width={0}
        height={0}
      />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          {customTitle || `${object} yang anda cari tidak ditemukan`}
        </h3>
        <p className={`text-sm`}>{description}</p>
        {children}
      </div>
    </div>
  );
}

export default NotFoundInfo;