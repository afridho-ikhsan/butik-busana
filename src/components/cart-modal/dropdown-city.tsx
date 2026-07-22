import { useGetCitiesByProvince } from "@/utils/location-utils";
import { Select } from "antd";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const idProvinsi = provinsi.split(";")[0];
  const { kota, isLoading } = useGetCitiesByProvince(idProvinsi, isOpen);
  const disabled = !idProvinsi;

  return (
    <div className="input-data">
      <Select
        showSearch
        allowClear
        size="large"
        className="w-full"
        id="kota"
        placeholder="Pilih Kota"
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
        options={kota.map((item) => ({
          value: `${item.id};${item.name}`,
          label: item.name,
        }))}
        notFoundContent={isLoading ? "Memuat..." : "Kota tidak ditemukan"}
      />
      {validationErrorMessage && (
        <p className="validation-error-message">{validationErrorMessage}</p>
      )}
    </div>
  );
}

export default DropdownCity;
