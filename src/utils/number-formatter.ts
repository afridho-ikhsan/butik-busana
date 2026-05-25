export const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

export const gramFormatter = new Intl.NumberFormat("id-ID", {
  style: "unit",
  unit: "gram",
  unitDisplay: "narrow",
});

export const formatPhoneNumber = (phone: string) => {
  // Menghapus kode negara "62" di awal
  const number = phone.substring(2);

  // Format nomor telepon berdasarkan panjang string yang tersedia
  if (number.length <= 3) {
    return `+62 ${number}`;
  } else if (number.length <= 7) {
    return `+62 ${number.substring(0, 3)}-${number.substring(3)}`;
  } else {
    return `+62 ${number.substring(0, 3)}-${number.substring(
      3,
      7
    )}-${number.substring(7)}`;
  }
};
