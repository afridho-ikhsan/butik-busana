"use client";

import { Alert } from "antd";
import { useSyncExternalStore } from "react";

function subscribeOnlineState(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

export function CatalogOfflineBar() {
  const isOnline = useSyncExternalStore(
    subscribeOnlineState,
    getOnlineSnapshot,
    getOnlineServerSnapshot
  );
  if (isOnline) return null;
  return (
    <Alert
      showIcon
      type="warning"
      className="mb-3"
      message="Anda sedang luring"
      description="Katalog memakai data yang pernah disimpan di perangkat saat Anda masih tersambung internet. Hubungkan kembali untuk memperbarui."
    />
  );
}
