"use client";

import { cn } from "@/utils/cn";
import {
  createContext,
  RefObject,
  useContext,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface DropdownContextType {
  isOpen: boolean;
  onToggle: () => void;
  dropdownTriggerButtonRef: RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextType>({
  isOpen: false,
  onToggle: () => {},
  dropdownTriggerButtonRef: { current: null },
});

function Dropdown({
  children,
  isOpen,
  toggleFn,
}: {
  children: React.ReactNode;
  isOpen?: boolean;
  toggleFn?: () => void;
}) {
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const dropdownTriggerButtonRef = useRef(null);

  function onToggle() {
    console.log("click!");
    setIsOpenStatus((val) => !val);
  }

  return (
    <DropdownContext
      value={{
        onToggle: toggleFn || onToggle,
        isOpen: isOpen || isOpenStatus,
        dropdownTriggerButtonRef,
      }}
    >
      {children}
    </DropdownContext>
  );
}

function Icon({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const { onToggle, dropdownTriggerButtonRef } = useContext(DropdownContext);
  return (
    <div
      onClick={onToggle}
      className={cn("min-w-8 rounded-lg relative cursor-pointer", className)}
      ref={dropdownTriggerButtonRef}
    >
      {children}
    </div>
  );
}

function OpenedModal({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const { isOpen, dropdownTriggerButtonRef } = useContext(DropdownContext);

  return !dropdownTriggerButtonRef.current
    ? null
    : createPortal(
        <div
          className={cn(
            `cursor-default overflow-hidden p-3 bg-slate-50 shadow min-w-8 rounded-lg absolute top-[103%] right-0 delay-75 ease-out transition-all ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-5 opacity-0 -z-10 pointer-events-none"
            }`,
            className
          )}
          {...props}
        >
          {children}
        </div>,
        dropdownTriggerButtonRef.current
      );
}

Dropdown.Icon = Icon;
Dropdown.OpenedModal = OpenedModal;

export default Dropdown;
