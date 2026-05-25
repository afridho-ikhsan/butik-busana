"use client";

import { PiMoneyLight } from "react-icons/pi";
import { Modal } from "../modal";
import PaymentPage from "../payment-page";
import PrimaryButton from "../primary-button";

function PayButton({
  orderId,
  buttonText,
  className,
  orderNumber
}: {
  orderId: string;
  buttonText?: string;
  className?: string;
  orderNumber: string
}) {
  return (
    <Modal>
      <Modal.Open>
        {
          <PrimaryButton
            className={
              className
            }
          >
            {buttonText}
          </PrimaryButton>
        }
      </Modal.Open>
      <Modal.OpenedModal
        modalTitle={`Pembayaran Pesanan #${orderNumber}`}
        modalIcon={<PiMoneyLight className="text-2xl md:text-3xl shrink-0" />}
      >
        <PaymentPage orderId={orderId} orderNumber={orderNumber} />
      </Modal.OpenedModal>
    </Modal>
  );
}

export default PayButton;
