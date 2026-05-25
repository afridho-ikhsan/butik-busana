import Image from "next/image";
import WarningIcon from "@/assets/warning.svg";

function ErrorInfo({
  description,
  customTitle,
  customIconUrl,
  children,
}: {
  customTitle?: string;
  description?: string;
  customIconUrl?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-5 flex flex-col justify-center items-center gap-3 min-h-[30rem] h-full w-full">
      <Image src={customIconUrl || WarningIcon} alt="" className="w-24 h-24" />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">
          {customTitle || `Terjadi kesalahan internal`}
        </h3>
        <p className={`text-sm`}>
          {description ||
            "Mohon maaf atas kendala yang terjadi, anda bisa menghubungi kami mengenai kesalahan ini agar kami bisa mengetahui lebih cepat dan mengatasi masalah ini secepat mungkin"}
        </p>
        {children}
      </div>
    </div>
  );
}

export default ErrorInfo;
