export interface ItemOptions {
  variantName?: string | null;
  variantId?: string | null;
  productLink?: string | null;
}

export interface CheckoutLineItemType {
  id: string;
  itemType: string;
  price: number;
  productName: string;
  quantity: number;
  image: string;
  weight: number;
  catalogReference: {
    appId: string;
    catalogItemId: string;
    options?: ItemOptions;
  };
}

export interface BuyerInfoType {
  memberId: string;
  contactId: string;
  nama: string;
  nomorHp: string;
  email: string;
}

export interface CheckoutDataType {
  informasiPembeli: BuyerInfoType;
  alamat: string;
  catatan?: string;
  lineItems: CheckoutLineItemType[];
  ongkir: number;
  layananKurir: string;
}

export interface MidtransNotificationMetadata {
  lineItems: CheckoutLineItemType[];
  buyerInfo: BuyerInfoType;
  alamat: string;
  layananKurir: string;
  catatan: string;
  ongkir: number;
}
