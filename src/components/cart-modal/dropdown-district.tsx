import { useGetDistrictsByCity } from "@/utils/location-utils";
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

function DropdownDistrict({
  value,
  onChange,
  kota,
  validationErrorMessage,
}: {
  value: string;
  onChange: (e: string) => void;
  kota: string;
  validationErrorMessage: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const kotaId = kota.split(";")[0];
  const { kecamatan, isLoading } = useGetDistrictsByCity(kotaId, isModalOpen);

  return (
    <div className="input-data">
      <Select
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onValueChange={onChange}
        disabled={kota === ""}
      >
        <SelectTrigger
          className={`w-full h-full bg-transparent border-2 border-slate-300 pl-4 pb-3 flex items-center outline-none rounded-lg text-sm focus:border-slate-500 ${
            value ? "pt-6" : "pt-3"
          } ${kota === "" ? "cursor-not-allowed" : "cursor-pointer"}`}
          id="provinsi"
          value={value}
        >
          <SelectValue placeholder="Pilih Kecamatan" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Kecamatan</SelectLabel>
            {isLoading ? (
              <SelectItem value="loading ">Memuat...</SelectItem>
            ) : (
              kecamatan.map((kecamatanItem) => (
                <SelectItem
                  key={kecamatanItem.id}
                  value={`${kecamatanItem.name}`}
                >
                  {kecamatanItem.name}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      <label
        htmlFor="district"
        className={`absolute transition-all duration-200 text-slate-400 ${
          value ? "text-xs top-1.5 left-4" : "hidden"
        }`}
      >
        Pilih Kecamatan
      </label>
      {validationErrorMessage && (
        <p className="validation-error-message">
          {validationErrorMessage}
        </p>
      )}
    </div>
  );
}

export default DropdownDistrict;
