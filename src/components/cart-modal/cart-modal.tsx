"use client";

import { useUnifiedCart } from "@/hooks/useUnifiedCart";
import { formatPhoneNumber, rupiahFormatter } from "@/utils/number-formatter";
import React, { useEffect, useReducer } from "react";
import { IoCartOutline } from "react-icons/io5";
import PrimaryButton from "../primary-button";
import SecondaryButton from "../secondary-botton";
import useCurrentMember from "@/hooks/useCurrentMember";
import CartItem from "../cart-item";
import ProvinceSelect from "./dropdown-provinsi";
import DropdownCity from "./dropdown-city";
import DropdownDistrict from "./dropdown-district";
import DropdownKurir from "./dropdown-kurir";
import { redirectToCheckout } from "@/lib/redirect-to-checkout";
import { toast } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import { CheckoutLineItemType } from "@/types/checkout-types";
import { Modal } from "../modal";
import {
  ActionType,
  cartReducer,
  initialState,
  modalIconMap,
  modalTitleMap,
} from "./modal-data";
import { confirmAlert } from "react-confirm-alert";
import ConfirmationBox from "../confirmation.box";
import { MdOutlineInfo } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import PaymentPage from "../payment-page";
import { Input, Button, Row, Col } from "antd";

function CartModal() {
  const { cart, getCart, counter, isLoading, deleteCart } = useUnifiedCart();
  const { member, isLoggedIn } = useCurrentMember();
  const pathname = usePathname();
  const router = useRouter();
  const { TextArea } = Input;

  useEffect(() => {
    getCart();
  }, [getCart]);

  const [
    {
      alamat,
      isModalOpen,
      nama,
      nomorHp,
      step,
      totalCartItem,
      catatan,
      provinsi,
      kota,
      kecamatan,
      kurir,
      ongkir,
      layananKurir,
      errors,
      isValidToValidate,
      buktiTf,
      createdOrder: { orderId, orderNumber },
    },
    dispatch,
  ] = useReducer(cartReducer, initialState);

  const { mutate: triggerCreateOrder, isPending: createOrderPending } =
    useMutation({
      mutationKey: ["newOrder"],
      mutationFn: async (payWithMidtrans?: boolean) => {
        if (Object.values(errors).some((error) => error))
          return toast.error("Data yang anda masukkan masih ada yang belum sesuai.");

        if (!isLoggedIn) {
          const lineItemsForGuest = (cart.lineItems as {
            productName?: string | { original?: string };
            price?: number;
            quantity?: number;
            image?: string;
            physicalProperties?: { weight?: number };
          }[]).map((item) => {
            const productName = typeof item.productName === "string"
              ? item.productName
              : (item.productName as { original?: string })?.original || "";
            return {
              productName,
              price: typeof item.price === "number" ? item.price : parseFloat(String(item?.price || "0")) || 0,
              quantity: item.quantity || 0,
              image: item.image || "",
              weight: item.physicalProperties?.weight || 0,
            };
          });

          const fullAddress = [alamat, kecamatan, kota.split(";")[1] || "", provinsi.split(";")[1] || ""]
            .filter(Boolean)
            .join(", ");
          const res = await fetch("/api/orders/guest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama,
              nomorHp,
              alamat: fullAddress || alamat,
              catatan,
              ongkir: Number(ongkir) || 0,
              layananKurir: layananKurir || "",
              lineItems: lineItemsForGuest,
            }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Gagal membuat pesanan");
          }

          const createdOrder = await res.json();
          deleteCart();
          dispatch({ type: ActionType.CLOSE_MODAL });
          router.push(`/order/${createdOrder._id}`);
          return null;
        }

        const createdOrder = await redirectToCheckout(
          {
            informasiPembeli: {
              memberId: member?._id || "",
              contactId: member?.contactId || "",
              nama,
              nomorHp,
              email: member?.loginEmail || "",
            },
            alamat: `${alamat}, ${kecamatan}, ${kota.split(";")[1] || ""}, ${provinsi.split(";")[1] || ""}.`,
            catatan,
            lineItems: (cart.lineItems as {
              _id?: string;
              productName?: string | { original?: string };
              price?: number;
              quantity?: number;
              image?: string;
              physicalProperties?: { weight?: number };
              catalogReference?: {
                appId?: string;
                catalogItemId?: string;
                options?: { productLink?: string; variantId?: string; variantName?: string };
              };
            }[]).map((item) => {
              const productName = typeof item.productName === "string"
                ? item.productName
                : item.productName?.original || "";
              const price = typeof item.price === "number"
                ? item.price
                : parseFloat(item?.price || "0") || 0;
              const sentItem: CheckoutLineItemType = {
                id: item._id || "",
                itemType: "PHYSICAL",
                price,
                productName,
                quantity: item.quantity || 0,
                image: item.image || "",
                weight: item.physicalProperties?.weight || 0,
                catalogReference: {
                  appId: item.catalogReference?.appId || "toserbanet",
                  catalogItemId: item.catalogReference?.catalogItemId || "",
                  options: {
                    productLink: item.catalogReference?.options?.productLink || null,
                    variantId: item.catalogReference?.options?.variantId || null,
                    variantName: item.catalogReference?.options?.variantName || null,
                  },
                },
              };

              return sentItem;
            }),
            ongkir,
            layananKurir,
          },
          member?._id || "",
          !!payWithMidtrans
        );

        if (payWithMidtrans) return null;

        if (!createdOrder) throw new Error("Terjadi kesalahan saat melakukan order");

        dispatch({
          type: ActionType.TO_STEP_3,
          payload: {
            orderId: createdOrder._id || "",
            orderNumber: createdOrder.number || "",
          },
        });
      },
      onError: () => {
        dispatch({ type: ActionType.TO_STEP_1 });
        toast.error("Terdapat kesalahan saat melakukan order");
      },
    });

  useEffect(() => {
    if (step === 2 && isValidToValidate) triggerCreateOrder(false);
  }, [isValidToValidate, step, triggerCreateOrder]);

  useEffect(() => {
    if (isValidToValidate) dispatch({ type: ActionType.VALIDATE_FORM });
  }, [
    alamat,
    nama,
    nomorHp,
    provinsi,
    kota,
    kecamatan,
    kurir,
    layananKurir,
    isValidToValidate,
  ]);

  useEffect(() => {
    const items = (cart.lineItems as { quantity?: number }[]) || [];
    const totalQty = items.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0
    );
    dispatch({
      type: ActionType.SET_STATE,
      changedStateAttr: "totalCartItem",
      payload: totalQty,
    });
  }, [cart.lineItems.length]);

  useEffect(() => {
    if (totalCartItem === 0 && step !== 3) {
      dispatch({ type: ActionType.TO_STEP_1 });
    }
  }, [totalCartItem]);

  if (/^\/user\/[^\/]+\/transactions\/[^\/]+$/.test(pathname)) {
    return null;
  }

  function handleClose() {
    if (step === 3) {
      deleteCart();
      router.push(`/user/${member?.profile?.slug}/transactions`);
    }
    dispatch({ type: ActionType.CLOSE_MODAL });
  }

  const lineItems = (cart.lineItems || []) as {
    _id?: string;
    quantity?: number;
    fullPrice?: { amount?: string };
    price?: number;
  }[];

  const subtotalAmount = lineItems.reduce(
    (acc, item) =>
      acc +
      (item.quantity || 0) * (item?.price || 0),
    0
  );

  return (
    <div className="shadow-lg h-max bg-slate-50/50 backdrop-blur-md w-full sticky bottom-0 left-0 flex justify-between items-center gap-5 flex-wrap p-5 z-10">
      <div className="flex justify-between items-center gap-5 lg:gap-7">
        <div className="relative ">
          <IoCartOutline className="text-3xl" />

          <div className="rounded-full h-5 w-5 bg-red-500 text-slate-50 absolute left-[80%] -top-2 flex items-center justify-center">
            {counter}
          </div>
        </div>

        <div className="flex flex-col ">
          <p>Total Belanja</p>
          <p className="font-semibold text-red-500">
            {rupiahFormatter.format(subtotalAmount)}
          </p>
        </div>
      </div>

      <Modal
        handleClose={handleClose}
        handleOpen={() => dispatch({ type: ActionType.OPEN_MODAL })}
        isOpen={isModalOpen}
      >
        <Modal.Open>
          {isLoggedIn ? (
            <PrimaryButton
              className="text-sm md:text-xl gap-1 lg:gap-3"
              onClick={() => dispatch({ type: ActionType.OPEN_MODAL })}
            >
              <IoCartOutline />
              Checkout
            </PrimaryButton>
          ) : (
            <SecondaryButton
              className="text-sm md:text-xl gap-1 lg:gap-3"
              onClick={() => dispatch({ type: ActionType.OPEN_MODAL })}
            >
              <IoCartOutline />
              Checkout
            </SecondaryButton>
          )}
        </Modal.Open>

        <Modal.OpenedModal
          modalIcon={React.createElement(modalIconMap.get(step)!, {
            className: "text-2xl md:text-3xl shrink-0",
          })}
          modalTitle={modalTitleMap.get(step) || modalTitleMap.get(1)!}
        >
          {createOrderPending ? (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-lg h-full top-0 bg-slate-50/50 z-10">
              <div className="loader"></div>
            </div>
          ) : null}
          {step === 2 && (
            <div className="mt-16 min-[320px]:mt-8 md:mt-3 w-full">
              <Row gutter={[16, 12]}>
                <Col xs={24} sm={12}>
                  <div className="flex flex-col gap-1">
                    <Input
                      type="text"
                      id="nama"
                      placeholder="Nama Penerima"
                      value={nama}
                      onChange={(e) => {
                        dispatch({
                          type: ActionType.SET_STATE,
                          changedStateAttr: "nama",
                          payload: e.target.value,
                        });
                      }}
                      status={errors.nama ? "error" : undefined}
                      size="large"
                    />
                    {errors.nama && (
                      <p className="validation-error-message text-xs">{errors.nama}</p>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="flex flex-col gap-1">
                    <Input
                      type="tel"
                      id="nomorHp"
                      placeholder="Nomor Telepon"
                      value={nomorHp}
                      onChange={(e) => {
                        const input = e.target.value;
                        const cleanedPhone = input.replace(/\D/g, "");
                        if (cleanedPhone.length === 0) {
                          dispatch({
                            type: ActionType.SET_STATE,
                            changedStateAttr: "nomorHp",
                            payload: "",
                          });
                          return;
                        }
                        if (cleanedPhone.startsWith("62")) {
                          dispatch({
                            type: ActionType.SET_STATE,
                            changedStateAttr: "nomorHp",
                            payload: formatPhoneNumber(cleanedPhone),
                          });
                        } else {
                          dispatch({
                            type: ActionType.SET_STATE,
                            changedStateAttr: "nomorHp",
                            payload: cleanedPhone,
                          });
                        }
                      }}
                      status={errors.nomorHp ? "error" : undefined}
                      size="large"
                    />
                    {errors.nomorHp && (
                      <p className="validation-error-message text-xs">{errors.nomorHp}</p>
                    )}
                  </div>
                </Col>
                <Col span={24}>
                  <div className="flex flex-col gap-1">
                    <TextArea
                      id="alamat"
                      placeholder="Nama Jalan, Gedung, No. Rumah"
                      value={alamat}
                      onChange={(e) => {
                        dispatch({
                          type: ActionType.SET_STATE,
                          changedStateAttr: "alamat",
                          payload: e.target.value,
                        });
                      }}
                      status={errors.alamat ? "error" : undefined}
                      rows={3}
                      size="large"
                      style={{ resize: "none" }}
                    />
                    {errors.alamat && (
                      <p className="validation-error-message text-xs">{errors.alamat}</p>
                    )}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <ProvinceSelect
                    value={provinsi}
                    onChange={(val) => {
                      dispatch({
                        type: ActionType.CHOOSE_PROVINCE,
                        payload: val,
                      });
                    }}
                    validationErrorMessage={errors.provinsi}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <DropdownCity
                    value={kota}
                    onChange={(val) => {
                      dispatch({
                        type: ActionType.CHOOSE_CITY,
                        payload: val,
                      });
                    }}
                    provinsi={provinsi}
                    validationErrorMessage={errors.kota}
                  />
                </Col>
                <Col span={24}>
                  <DropdownDistrict
                    value={kecamatan}
                    onChange={(val) => {
                      dispatch({
                        type: ActionType.CHOOSE_DISTRICT,
                        payload: val,
                      });
                    }}
                    kota={kota}
                    validationErrorMessage={errors.kecamatan}
                  />
                </Col>
                <Col span={24}>
                  <DropdownKurir
                    isDisabled={!provinsi || !kota || !kecamatan}
                    kurir={kurir}
                    kecamatan={kecamatan}
                    ongkir={ongkir}
                    onChangeKurir={async (val) => {
                      dispatch({
                        type: ActionType.CHOOSE_KURIR,
                        payload: val,
                      });
                    }}
                    courierValidationErrorMessage={errors.kurir}
                    onChangeLayananKurir={async (val: string) => {
                      dispatch({
                        type: ActionType.CHOOSE_COURIER_SERVICE,
                        payload: val,
                      });
                    }}
                    courierServiceValidationErrorMessage={errors.layananKurir}
                  />
                </Col>
                <Col span={24}>
                  <div className="flex flex-col gap-1">
                    <Input
                      id="catatan"
                      placeholder="Catatan"
                      value={catatan}
                      onChange={(e) => {
                        dispatch({
                          type: ActionType.SET_STATE,
                          changedStateAttr: "catatan",
                          payload: e.target.value,
                        });
                      }}
                      size="large"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {step === 3 && (
            <PaymentPage orderId={orderId} orderNumber={orderNumber} />
          )}

          {step < 3 ? (
            cart.lineItems && cart.lineItems.length > 0 ? (
              <>
                <div
                  className={`flex flex-col gap-3 overflow-y-auto scrollbar pr-1 mt-3 w-full ${step === 2 ? "max-h-40" : "max-h-96"
                    }`}
                >
                  {lineItems.map((item, i) => (
                    <CartItem cartItem={lineItems[i]} key={i} />
                  ))}
                </div>
              </>
            ) : (
              <div className="my-16 flex flex-col gap-3 items-center">
                <IoCartOutline className="text-[5rem] md:text-[7rem]" />
                <h3 className=" md:text-xl text-center">
                  Keranjang Anda masih kosong
                </h3>
              </div>
            )
          ) : null}

          <div className="flex flex-col gap-2 justify-center items-center text-center md:text-start w-full">
            {step < 3 && (
              <div className="text-center space-y-2 divide-y-2 divide-slate-300">
                <div className="space-y-1">
                  <p className="text-sm md:text-base">
                    Sub Total Harga ({totalCartItem} Produk){" "}
                    <span className="text-green-500 font-bold text-sm">
                      {rupiahFormatter.format(subtotalAmount)}
                    </span>
                  </p>
                  {ongkir > 0 && (
                    <p className="text-sm md:text-base">
                      Ongkos Kirim{" "}
                      <span className="text-green-500 font-bold text-sm">
                        {rupiahFormatter.format(ongkir)}
                      </span>
                    </p>
                  )}
                </div>

                {subtotalAmount && ongkir ? (
                  <p className="text-base md:text-base">
                    Total{" "}
                    <span className="text-green-500 font-bold text-lg">
                      {rupiahFormatter.format(subtotalAmount + ongkir)}
                    </span>
                  </p>
                ) : null}
              </div>
            )}

            <hr className="h-0.5 bg-slate-200 rounded-full" />

            <div className="flex gap-3 flex-col md:flex-row items-center justify-between text-xs lg:text-sm w-full">
              {step === 1 && (
                <>
                  <Button
                    className="border-2 border-slate-300 w-full p-3 rounded-lg"
                    onClick={handleClose}
                  >
                    Belanja Lagi
                  </Button>
                  <Button
                    type="primary"
                    className="w-full p-3"
                    disabled={isLoading}
                    onClick={() => {
                      dispatch({
                        type: ActionType.TO_STEP_2_FROM_1,
                        payload: {
                          defaultName: isLoggedIn ? (member?.profile?.nickname || "") : "",
                          defaultPhone: isLoggedIn
                            ? ((member?.contact?.phones && member?.contact?.phones[0]) || "")
                            : "",
                          defaultAddress: isLoggedIn
                            ? ((member?.contact?.addresses && member?.contact?.addresses[0]?.addressLine) || "")
                            : "",
                        },
                      });
                    }}
                  >
                    Lanjut
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Button
                    className="border-2 border-slate-300 w-full p-3 rounded-lg"
                    onClick={() => dispatch({ type: ActionType.TO_STEP_1 })}
                  >
                    Kembali
                  </Button>
                  <Button
                    type="primary"
                    className="w-full p-3"
                    onClick={async () => {
                      dispatch({ type: ActionType.SET_STATE, changedStateAttr: "isValidToValidate", payload: false });
                      if (!!buktiTf) return dispatch({ type: ActionType.PAY });

                      confirmAlert({
                        customUI: ({ onClose }: { onClose: () => void }) => {
                          return (
                            <ConfirmationBox
                              icon={<MdOutlineInfo />}
                              judul="Konfirmasi Data"
                              pesan="Apakah data pemesanan yang anda masukkan sudah benar?"
                              onClose={onClose}
                              onClickIya={async () => {
                                dispatch({ type: ActionType.PAY });
                              }}
                              labelIya="Sudah"
                              labelTidak="Hmm, sebentar."
                              yesButtonClassName="bg-blue-500 text-slate-50"
                            />
                          );
                        },
                      });
                    }}
                  >
                    Lanjut Pembayaran
                  </Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Button
                    type="primary"
                    onClick={handleClose}
                    className="w-full px-5 py-3 text-slate-50 col-span-8 h-max"
                  >
                    Ke Halaman Transaksi
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal.OpenedModal>
      </Modal>
    </div>
  );
}

export default CartModal;
