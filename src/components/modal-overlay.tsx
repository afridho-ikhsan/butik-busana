function ModalOverlay({ handleClose }: { handleClose?: () => void }) {
  return (
    <div
      className={`bg-slate-900/50 fixed left-0 top-0 right-0 bottom-0 cursor-pointer transition-all opacity-100 z-20`}
      onClick={handleClose}
    />
  );
}

export default ModalOverlay;
