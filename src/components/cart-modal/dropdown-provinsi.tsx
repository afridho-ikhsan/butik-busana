import { useGetProvinces } from "@/utils/location-utils";
import { Select } from "antd";
import { useState } from "react";

const ProvinceSelect = ({
  value,
  onChange,
  validationErrorMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  validationErrorMessage: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { provinsi, isLoading } = useGetProvinces(isOpen);

  return (
    <div className="input-data">
      <Select
        showSearch
        allowClear
        size="large"
        className="w-full"
        id="provinsi"
        placeholder="Pilih Provinsi"
        value={value || undefined}
        onChange={(val) => onChange(val || "")}
        onOpenChange={setIsOpen}
        loading={isLoading}
        status={validationErrorMessage ? "error" : undefined}
        optionFilterProp="label"
        filterOption={(input, option) =>
          String(option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        options={provinsi.map((item) => ({
          value: `${item.id};${item.name}`,
          label: item.name,
        }))}
        notFoundContent={isLoading ? "Memuat..." : "Provinsi tidak ditemukan"}
      />
      {validationErrorMessage && (
        <p className="validation-error-message">{validationErrorMessage}</p>
      )}
    </div>
  );
};

export default ProvinceSelect;
