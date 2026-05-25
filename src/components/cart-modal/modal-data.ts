import { LuShoppingBag } from "react-icons/lu";
import { GrNotes } from "react-icons/gr";
import { PiMoneyLight } from "react-icons/pi";
import { toast } from "react-toastify";

export const modalTitleMap = new Map([
  [1, "Daftar Belanja Anda"],
  [2, "Data Pemesanan"],
  [3, "Opsi Pembayaran"],
]);

export const modalIconMap = new Map([
  [1, LuShoppingBag],
  [2, GrNotes],
  [3, PiMoneyLight],
]);

export enum ActionType {
  CLOSE_MODAL,
  OPEN_MODAL,
  SET_STATE,
  TO_STEP_1,
  TO_STEP_2_FROM_1,
  TO_STEP_2_FROM_3,
  PAY,
  CHOOSE_PROVINCE,
  CHOOSE_CITY,
  CHOOSE_DISTRICT,
  CHOOSE_POSTCODE,
  CHOOSE_KURIR,
  CHOOSE_COURIER_SERVICE,
  VALIDATE_FORM,
  TO_STEP_3,
}

export const initialState = {
  isModalOpen: false,
  step: 1,
  nama: "",
  nomorHp: "",
  alamat: "",
  catatan: "",
  provinsi: "",
  kota: "",
  kecamatan: "",
  kurir: "",
  layananKurir: "",
  ongkir: 0,
  totalCartItem: 0,
  buktiTf: "",
  errors: {
    nama: "",
    nomorHp: "",
    alamat: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kurir: "",
    layananKurir: "",
  },
  isValidToValidate: false,
  createdOrder: {
    orderId: "",
    orderNumber: "",
  },
  firstErrorField: "",
};

export function validateForm(state: typeof initialState) {
  const errors: typeof initialState.errors = {
    nama: "",
    nomorHp: "",
    alamat: "",
    provinsi: "",
    kota: "",
    kecamatan: "",
    kurir: "",
    layananKurir: "",
  };

  if (!state.nama || state.nama === "")
    errors.nama = "Nama Penerima wajib diisi";
  if (!state.nomorHp || state.nomorHp === "") {
    errors.nomorHp = "Nomor Telepon wajib diisi";
  } else if (!/^62\d{9,}$/.test(state.nomorHp.replace(/\D/g, ""))) {
    errors.nomorHp =
      "Nomor yang anda masukkan tidak sesuai format, pastikan nomor yang dimasukkan diawali dengan 628";
  }
  if (!state.alamat || state.alamat === "")
    errors.alamat = "Alamat wajib diisi";
  if (!state.provinsi || state.provinsi === "")
    errors.provinsi = "Provinsi wajib dipilih";
  if (!state.kota || state.kota === "") errors.kota = "Kota wajib dipilih";
  if (!state.kecamatan || state.kecamatan === "")
    errors.kecamatan = "Kecamatan wajib dipilih";
  if (!state.kurir || state.kurir === "") errors.kurir = "Kurir wajib dipilih";
  if (!state.layananKurir || state.layananKurir === "")
    errors.layananKurir = "Opsi layanan kurir wajib dipilih";

  return errors;
}

export function cartReducer(
  prevState: typeof initialState,
  action: {
    type: ActionType;
    payload?: any;
    changedStateAttr?: keyof typeof initialState;
  }
): typeof initialState {
  switch (action.type) {
    case ActionType.CLOSE_MODAL:
      return {
        ...initialState,
        totalCartItem: prevState.totalCartItem,
        isValidToValidate: false,
        buktiTf: "",
        createdOrder: {
          orderId: "",
          orderNumber: "",
        },
      };
    case ActionType.OPEN_MODAL:
      return {
        ...prevState,
        isModalOpen: true,
        isValidToValidate: false,
        createdOrder: {
          orderId: "",
          orderNumber: "",
        },
      };
    case ActionType.SET_STATE:
      if (action.payload !== undefined && action.changedStateAttr) {
        return {
          ...prevState,
          [action.changedStateAttr]: action.payload,
        };
      }
      console.log("Payload / State Attribute belum dimasukkan ke parameter");
      return prevState;
    case ActionType.TO_STEP_1:
      return {
        ...prevState,
        isValidToValidate: false,
        step: 1,
        createdOrder: {
          orderId: "",
          orderNumber: "",
        },
      };
    case ActionType.TO_STEP_2_FROM_1:
      if (prevState.totalCartItem === 0) {
        toast.error("Keranjang Anda masih kosong");
        return prevState;
      }

      return {
        ...prevState,
        step: 2,
        nama: action.payload.defaultName,
        nomorHp: action.payload.defaultPhone,
        alamat: action.payload.defaultAddress,
      };
    case ActionType.TO_STEP_2_FROM_3:
      return {
        ...prevState,
        step: 2,
      };
    case ActionType.TO_STEP_3:
      return {
        ...prevState,
        step: 3,
        createdOrder: {
          orderId: action.payload.orderId,
          orderNumber: action.payload.orderNumber,
        },
      };
    case ActionType.CHOOSE_PROVINCE:
      return {
        ...prevState,
        provinsi: action.payload,
        kota: "",
        kecamatan: "",
        kurir: "",
        ongkir: 0,
        layananKurir: "",
      };
    case ActionType.CHOOSE_CITY:
      return {
        ...prevState,
        kota: action.payload,
        kecamatan: "",
        kurir: "",
        ongkir: 0,
        layananKurir: "",
      };
    case ActionType.CHOOSE_DISTRICT:
      return {
        ...prevState,
        kecamatan: action.payload,
        kurir: "",
        ongkir: 0,
        layananKurir: "",
      };
    case ActionType.CHOOSE_KURIR:
      return {
        ...prevState,
        kurir: action.payload,
        ongkir: 0,
        layananKurir: "",
      };
    case ActionType.CHOOSE_COURIER_SERVICE:
      return {
        ...prevState,
        layananKurir: action.payload,
        ongkir: Number(action.payload?.split(" | ")[2] || "0"),
      };
    case ActionType.PAY:
      const errors = validateForm(prevState);
      return {
        ...prevState,
        errors: errors,
        isValidToValidate: true,
      };
    case ActionType.VALIDATE_FORM:
      const errorMessages = validateForm(prevState);

      if (!Object.values(errorMessages).some((error) => error)) {
        return {
          ...prevState,
          isValidToValidate: false,
          errors: errorMessages,
        };
      }

      return {
        ...prevState,
        errors: errorMessages,
      };
    default:
      return prevState;
  }
}
