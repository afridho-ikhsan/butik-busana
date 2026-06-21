"use client";

import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useWindowDimensions } from "@/hooks/useWindowDimention";
import { NotificationOutlined } from "@ant-design/icons";
import { App, Button, Flex, Typography } from "antd";
import { Bell, BellOff } from "lucide-react";
import { getOrCreateGuestPushKey } from "@/lib/guest-push-key";
import { useEffect, useState } from "react";

const { Text } = Typography;

const showTestPushButton =
  process.env.NEXT_PUBLIC_PUSH_TEST_ENABLED === "true";

export default function PushNotificationPrompt() {
  return (
    <App>
      <PushNotificationPromptContent />
    </App>
  );
}

function PushNotificationPromptContent() {
  const { modal, message } = App.useApp();
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
  const [mounted, setMounted] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
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
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    const timeoutId = setTimeout(() => {
      message.error("Terjadi kesalahan saat menonaktifkan notifikasi");
      setLoading(false);
    }, 15000);
    try {
      const success = await unsubscribe();
      if (success) {
        message.success("Notifikasi dinonaktifkan");
      } else {
        message.error("Gagal menonaktifkan notifikasi");
      }
    } finally {
      clearTimeout(timeoutId);
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
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestKey: getOrCreateGuestPushKey() }),
      });
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

  if (!mounted) {
    return (
      <Button
        type="text"
        size="small"
        icon={<Bell className="w-5 h-5" />}
        className="text-slate-600 hover:text-blue-600"
        aria-label="Aktifkan notifikasi"
      />
    );
  }

  return (
    <Flex gap={8}>
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
        aria-label={isActive ? "Nonaktifkan notifikasi" : "Aktifkan notifikasi"}
        onClick={() =>
          isActive
            ? modal.confirm({
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
                  return handleDisable();
                },
                okText: "Nonaktifkan",
                cancelText: "Batal",
              })
            : modal.confirm({
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
                      Anda perlu memberikan izin untuk pengaktifan pertama kali.
                      {!isLoggedIn &&
                        " Notifikasi pesanan aktif setelah Anda login."}
                    </Text>
                  </>
                ),
                onOk() {
                  return handleEnable();
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
    </Flex>
  );
}

