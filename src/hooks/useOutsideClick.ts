"use client";

import { MouseEvent, useEffect, useRef } from "react";

export function useOutsideClick(
  handleClose: () => void,
  handleCapture = true,
  isForModal?: boolean
) {
  const modal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOverlay(e: MouseEvent<HTMLDivElement>) {
      if (isForModal) {
        if (
          (e.target as Element).classList.contains("modal-overlay") ||
          (e.target as Element).closest(".modal-close")
        )
          handleClose();
      } else {
        if (modal.current && !modal.current.contains(e.target as Node)) {
          handleClose();
        }
      }
    }
    const listener: EventListener =
      handleClickOverlay as unknown as EventListener;
    document.addEventListener("click", listener, handleCapture);

    return () => {
      document.removeEventListener("click", listener, handleCapture);
    };
  }, [handleCapture, handleClose]);

  return modal;
}
