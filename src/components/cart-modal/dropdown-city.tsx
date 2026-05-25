import { useGetCitiesByProvince } from "@/utils/location-utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function DropdownCity({
  value,
  onChange,
  provinsi,
  validationErrorMessage,
}: {
  value: string;
  onChange: (e: string) => void;
  provinsi: string;
  validationErrorMessage: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const idProvinsi = provinsi.split(";")[0];
  const { kota, isLoading } = useGetCitiesByProvince(idProvinsi, isModalOpen);

  return (
    <div className="input-data">
      <Select
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onValueChange={onChange}
        disabled={idProvinsi === ""}
      >
        <SelectTrigger
          className={`w-full h-full bg-transparent border-2 border-slate-300 pl-4 pb-3 flex items-center outline-none rounded-lg text-sm focus:border-slate-500 ${
            value ? "pt-6" : "pt-3"
          } ${idProvinsi === "" ? "cursor-not-allowed" : "cursor-pointer"}`}
          id="provinsi"
          value={value}
        >
          <SelectValue placeholder="Pilih Kota" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Provinsi</SelectLabel>
            {isLoading ? (
              <SelectItem value="loading ">Memuat...</SelectItem>
            ) : (
              kota.map((kotaItem) => (
                <SelectItem
                  key={kotaItem.id}
                  value={`${kotaItem.id};${kotaItem.name}`}
                >
                  {kotaItem.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <label
        htmlFor="kota"
        className={`absolute transition-all duration-200 text-slate-400 ${
          value ? "text-xs top-1.5 left-4" : "hidden"
        }`}
      >
        Pilih Kota
      </label>
      {validationErrorMessage && (
        <p className="validation-error-message">
          {validationErrorMessage}
        </p>
      )}
    </div>
  );
}

export default DropdownCity;
