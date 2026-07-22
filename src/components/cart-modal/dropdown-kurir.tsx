import React, { useState } from "react";
import { Select, Col, Row } from "antd";
import { useCart } from "@/hooks/useCart";
import { useQuery } from "@tanstack/react-query";
import { getOngkir, getRajaOngkirLocationsData } from "@/actions";

const KURIR_OPTIONS = [
  { value: "jne", label: "JNE" },
  { value: "jnt", label: "J&T" },
  { value: "sicepat", label: "SICEPAT" },
];

function DropdownKurir({
  kurir,
  kecamatan,
  layananKurir,
  onChangeKurir,
  onChangeLayananKurir,
  isDisabled = false,
  courierValidationErrorMessage,
  courierServiceValidationErrorMessage,
}: {
  kurir: string;
  kecamatan: string;
  layananKurir: string;
  onChangeKurir: (e: string) => void;
  onChangeLayananKurir: (e: string) => void;
  isDisabled?: boolean;
  courierValidationErrorMessage: string;
  courierServiceValidationErrorMessage: string;
}) {
  const { cart } = useCart();
  const [isLayananKurirModalOpen, setIsLayananKurirModalOpen] = useState(false);

  const lineItems = (cart.lineItems || []) as {
    physicalProperties?: { weight?: number };
  }[];
  const productsWeight = lineItems.reduce((acc, cur) => {
    if (!cur.physicalProperties?.weight) return acc + 0;
    return acc + cur.physicalProperties.weight * 1000;
  }, 0);

  const { data: daftarLayananKurir, isLoading } = useQuery({
    queryKey: ["layananKurir", kurir, kecamatan],
    queryFn: async () => {
      const districtId = await getRajaOngkirLocationsData(kecamatan);

      if (!districtId || !districtId.data) return null;

      const result = await getOngkir({
        destination: String(districtId.data),
        weight: productsWeight,
        courier: kurir,
        price: "lowest",
      });

      if ("error" in result) return [];

      return result;
    },
    enabled: isLayananKurirModalOpen && !!kurir && !!kecamatan,
  });

  const layananOptions =
    daftarLayananKurir && daftarLayananKurir.length > 0
      ? daftarLayananKurir.map((layanan) => ({
          value: `${layanan.name} | ${layanan.description} | ${layanan.cost}`,
          label: `${layanan.name} - ${layanan.service} - ${layanan.cost}`,
        }))
      : layananKurir
        ? [
            {
              value: layananKurir,
              label: layananKurir.split(" | ").slice(0, 2).join(" - "),
            },
          ]
        : [];

  return (
    <Row gutter={16}>
      <Col span={12} className="input-data">
        <Select
          showSearch
          allowClear
          size="large"
          className="w-full"
          id="kurir"
          placeholder="Pilih Kurir"
          value={kurir || undefined}
          onChange={(val) => onChangeKurir(val || "")}
          disabled={isDisabled}
          status={courierValidationErrorMessage ? "error" : undefined}
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={KURIR_OPTIONS}
        />
        {courierValidationErrorMessage && (
          <p className="validation-error-message">
            {courierValidationErrorMessage}
          </p>
        )}
      </Col>
      <Col span={12} className="input-data">
        <Select
          showSearch
          allowClear
          size="large"
          className="w-full"
          id="layanan-kurir"
          placeholder="Pilih Layanan Kurir"
          value={layananKurir || undefined}
          onChange={(val) => onChangeLayananKurir(val || "")}
          onOpenChange={setIsLayananKurirModalOpen}
          disabled={!kurir}
          loading={isLoading}
          status={courierServiceValidationErrorMessage ? "error" : undefined}
          optionFilterProp="label"
          filterOption={(input, option) =>
            String(option?.label ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          options={layananOptions}
          notFoundContent={
            isLoading
              ? "Memuat..."
              : "Kurir tidak tersedia, coba lokasi terdekat"
          }
        />
        {courierServiceValidationErrorMessage && (
          <p className="validation-error-message">
            {courierServiceValidationErrorMessage}
          </p>
        )}
      </Col>
    </Row>
  );
}

export default DropdownKurir;
