"use client";

import { useOutsideClick } from "@/hooks/useOutsideClick";
import { cn } from "@/utils/cn";
import React, { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

interface ModalContextType {
  isOpen: boolean;
  handleOpen: () => void;
  handleClose: () => void;
}

export const ModalContext = createContext<ModalContextType>({
  isOpen: false,
  handleOpen: () => {},
  handleClose: () => {},
});

function Modal({
  children,
  isOpen,
  handleOpen,
  handleClose,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  handleOpen?: () => void;
  handleClose?: () => void;
}) {
  const [isOpenStatus, setIsOpenStatus] = useState(false);

  handleOpen = handleOpen || (() => setIsOpenStatus(true));
  handleClose = handleClose || (() => setIsOpenStatus(false));

  return (
    <ModalContext
      value={{ isOpen: isOpen || isOpenStatus, handleOpen, handleClose }}
    >
      {children}
    </ModalContext>
  );
}

function Open({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { handleOpen } = useContext(ModalContext);
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleOpen();
      }}
      className={cn("min-w-8 rounded-lg relative ", className)}
    >
      {children}
    </div>
  );
}

function OpenedModal({
  children,
  className,
  modalButton,
  modalIcon,
  modalTitle,
  customCloseIcon,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  modalIcon?: React.ReactNode;
  modalTitle: string;
  customCloseIcon?: React.ReactNode;
  [key: string]: any;
}) {
  const { isOpen, handleClose } = useContext(ModalContext);
  let modal = useOutsideClick(handleClose, true, true);

  if (typeof window === "undefined") return null;

  return createPortal(
    <>
      <div
        className={`bg-slate-900/50 fixed left-0 top-0 right-0 bottom-0 cursor-pointer transition-all ${
          isOpen ? "opacity-100 z-40" : "opacity-0 -z-10"
        } modal-overlay`}
      />
      <div
        className={cn(
          `overflow-y-auto overflow-x-hidden cursor-default bg-slate-50 px-3 md:px-10 pb-8 pt-16 min-[361px]:pt-10 md:pt-16 w-[90%] max-w-[535px] h-fit fixed top-1/2 left-1/2 -translate-x-1/2 rounded-xl flex flex-col gap-3 justify-center items-center max-h-[90vh] ${
            isOpen
              ? "-translate-y-1/2 opacity-100 z-50 duration-500 delay-75"
              : "-translate-y-1/4 opacity-0 -z-10"
          }`,
          className
        )}
        ref={modal}
        {...props}
      >
        <div className="flex justify-between items-center gap-3 flex-wrap will-change-transform absolute top-5 w-full px-5">
          <div className="rounded-full flex items-center gap-2 w-[70%]">
            {modalIcon || null}
            <p className="font-medium text-base md:text-xl line-clamp-1">{modalTitle}</p>
          </div>

          <button className="rounded-full p-1 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-slate-400 hover:bg-slate-500 modal-close">
            {customCloseIcon || <IoClose className="text-slate-50 text-5xl" />}
          </button>
        </div>
        {children}
      </div>
    </>,
    window.document.body
  );
}

Modal.Open = Open;
Modal.OpenedModal = OpenedModal

export { Modal };
