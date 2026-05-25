import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useGetProvinces(isModalOpen: boolean): {
  isLoading: boolean;
  provinsi: {
    id: string;
    name: string;
  }[];
} {
  const { data: dataProvinsi, isLoading } = useQuery({
    queryKey: ["provinsi"],
    queryFn: async () => {
      const response = await axios.get(
        `https://afridho-ikhsan.github.io/api-wilayah-indonesia/api/provinces.json`
      );

      return response.data;
    },
    enabled: isModalOpen,
  });

  if (!dataProvinsi) return { provinsi: [], isLoading: true };

  return { provinsi: dataProvinsi, isLoading };
}

export function useGetCitiesByProvince(
  idProvinsi: string,
  isModalOpen: boolean
): {
  isLoading: boolean;
  kota: {
    id: string;
    province_id: string;
    name: string;
  }[];
} {
  const { data: dataKota, isLoading } = useQuery({
    queryKey: ["kota", idProvinsi],
    queryFn: async () => {
      if (idProvinsi === "") return null;

      const response = await axios.get(
        `https://afridho-ikhsan.github.io/api-wilayah-indonesia/api/regencies/${idProvinsi}.json`
      );

      return response.data;
    },
    enabled: isModalOpen,
  });

  if (!dataKota) return { kota: [], isLoading: true };

  return { kota: dataKota, isLoading };
}

export function useGetDistrictsByCity(
  idKota: string,
  isModalOpen: boolean
): {
  isLoading: boolean;
  kecamatan: {
    id: string;
    regency_id: string;
    name: string;
  }[];
} {
  const { data: dataKecamatan, isLoading } = useQuery({
    queryKey: ["kota", idKota],
    queryFn: async () => {
      if (idKota === "") return null;

      const response = await axios.get(
        `https://afridho-ikhsan.github.io/api-wilayah-indonesia/api/districts/${idKota}.json`
      );

      return response.data;
    },
    enabled: isModalOpen,
  });

  if (!dataKecamatan) return { kecamatan: [], isLoading: true };

  return { kecamatan: dataKecamatan, isLoading };
}
