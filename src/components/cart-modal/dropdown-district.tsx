import { useGetDistrictsByCity } from "@/utils/location-utils";
import { Select } from "antd";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const kotaId = kota.split(";")[0];
  const { kecamatan, isLoading } = useGetDistrictsByCity(kotaId, isOpen);
  const disabled = !kota;

  return (
    <div className="input-data">
      <Select
        showSearch
        allowClear
        size="large"
        className="w-full"
        id="kecamatan"
        placeholder="Pilih Kecamatan"
        value={value || undefined}
        onChange={(val) => onChange(val || "")}
        onOpenChange={setIsOpen}
        disabled={disabled}
        loading={isLoading}
        status={validationErrorMessage ? "error" : undefined}
        optionFilterProp="label"
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={kecamatan.map((item) => ({
          value: item.name,
          label: item.name,
        }))}
        notFoundContent={isLoading ? "Memuat..." : "Kecamatan tidak ditemukan"}
      />
      {validationErrorMessage && (
        <p className="validation-error-message">{validationErrorMessage}</p>
      )}
    </div>
  );
}

export default DropdownDistrict;
