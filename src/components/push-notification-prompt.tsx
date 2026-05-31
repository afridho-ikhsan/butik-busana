"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useWindowDimensions } from "@/hooks/useWindowDimention";
import { NotificationOutlined } from "@ant-design/icons";
import { Button, message, Modal, Typography } from "antd";
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

const { Text } = Typography;
const { confirm } = Modal;

const showTestPushButton =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_PUSH_TEST_ENABLED === "true";

export default function PushNotificationPrompt() {
  const {
    permission,
    subscribe,
    unsubscribe,
    isSubscribed,
    isLoggedIn,
    hasValidVapidPublicKey,
  } = usePushSubscription();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const { width } = useWindowDimensions();

  if (!isLoggedIn) return null;

  const handleEnable = async () => {
    setLoading(true);
    const t = setTimeout(() => {
      message.error("Terjadi kesalahan saat mengaktifkan notifikasi");
      setLoading(false);
    }, 15000);
    try {
      if (!hasValidVapidPublicKey) {
        message.error(
          "VAPID public key tidak valid. Jalankan: node scripts/generate-vapid.js"
        );
        return;
      }
      const result = await subscribe();
      if (result.ok) {
        message.success("Notifikasi push aktif");
        return;
      }
      message.error(result.error);
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    const t = setTimeout(() => {
      message.error("Terjadi kesalahan saat menonaktifkan notifikasi");
      setLoading(false);
    }, 15000);
    try {
      await unsubscribe();
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (permission !== "granted" || !isSubscribed) {
      message.warning("Aktifkan notifikasi terlebih dahulu");
      return;
    }
    setTestLoading(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (res.ok) {
        message.success("Push dikirim — cek notifikasi perangkat");
        return;
      }
      message.error(data.error || "Gagal mengirim push");
    } catch {
      message.error("Gagal mengirim push");
    } finally {
      setTestLoading(false);
    }
  };

  const isActive = permission === "granted" && isSubscribed;

  return (
    <>
      <Button
        type="text"
        size="small"
        icon={
          isActive ? (
            <BellOff className="lg:w-5 lg:h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )
        }
        disabled={loading}
        onClick={() =>
          isActive
            ? confirm({
                title: "Konfirmasi nonaktifkan notifikasi?",
                icon: <NotificationOutlined />,
                closable: true,
                centered: true,
                width: 450,
                content: (
                  <Text>
                    Apakah anda yakin ingin menonaktifkan fitur notifikasi?
                  </Text>
                ),
                onOk() {
                  handleDisable();
                },
                okText: "Nonaktifkan",
                cancelText: "Batal",
              })
            : confirm({
                title: "Konfirmasi aktivasi notifikasi?",
                icon: <NotificationOutlined />,
                closable: true,
                centered: true,
                width: 450,
                content: (
                  <>
                    <Text>
                      Apakah anda yakin ingin mengaktifkan fitur notifikasi?
                    </Text>
                    <br />
                    <Text className="!text-xs !text-slate-600">
                      Anda perlu memberikan izin untuk pengaktifan pertama kali
                    </Text>
                  </>
                ),
                onOk() {
                  handleEnable();
                },
                okText: "Izinkan",
                cancelText: "Tolak",
              })
        }
        loading={loading}
        className="text-slate-600 hover:text-blue-600"
      >
        {width < 1465
          ? `${loading ? "Memuat..." : ""}`
          : loading
            ? "Memuat..."
            : isActive
              ? "Nonaktifkan notifikasi"
              : permission === "granted"
                ? "Selesaikan aktivasi push"
                : "Aktifkan notifikasi"}
      </Button>
      {showTestPushButton && (
        <Button
          type="text"
          size="small"
          loading={testLoading}
          disabled={loading}
          onClick={handleTestPush}
        >
          Test Push
        </Button>
      )}
    </>
  );
}
