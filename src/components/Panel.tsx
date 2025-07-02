import React from "react";
import { domainComponents } from "./domains";
import { AnswerPayload } from "../types";
import DefaultPanel from "./DefaultPanel";

interface PanelProps {
  url: string;
  capturedJson: (AnswerPayload & { timestamp: number }) | null;
  executeScript: (script: string) => void;
  useDefaultPanel: boolean; // Thêm prop mới
}

const Panel: React.FC<PanelProps> = ({
  url,
  capturedJson,
  executeScript,
  useDefaultPanel,
}) => {
  // Nếu có URL và người dùng không chọn hiển thị panel mặc định
  if (url && !useDefaultPanel) {
    try {
      const { hostname } = new URL(url);
      const Component = domainComponents[hostname];

      // Nếu tìm thấy component riêng cho domain, hiển thị nó
      if (Component) {
        return (
          <div className="panel" style={{ padding: "0px" }}>
            <Component url={url} capturedJson={capturedJson} />
          </div>
        );
      }
    } catch (error) {
      console.error("URL không hợp lệ cho panel:", url);
    }
  }

  // Trong các trường hợp còn lại (không có URL, hoặc chọn panel mặc định,
  // hoặc có URL nhưng không có component riêng), hiển thị DefaultPanel.
  return <DefaultPanel executeScript={executeScript} />;
};

export default Panel;
