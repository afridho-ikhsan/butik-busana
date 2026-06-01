"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";

const theme = {
  components: {
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
      paragraphMarginBottom: 0,
    },
    Title: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
      paragraphMarginBottom: 0,
    },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
          {children}
      </ConfigProvider>
    </AntdRegistry>
  );
}
