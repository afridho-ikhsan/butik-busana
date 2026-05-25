import { useEffect } from "react";

export function useMidtransInit() {
  useEffect(() => {
    const snapScript = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string;
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT as string;

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}
