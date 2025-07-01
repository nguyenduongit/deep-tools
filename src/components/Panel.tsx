import React from "react";
import { domainComponents } from "./domains";
import { AnswerPayload } from "../types";
import DefaultPanel from "./DefaultPanel"; // Import component mới

interface PanelProps {
  url: string;
  capturedJson: (AnswerPayload & { timestamp: number }) | null;
  executeScript: (script: string) => void; // Nhận prop mới
}

const Panel: React.FC<PanelProps> = ({ url, capturedJson, executeScript }) => {
  // Nếu có URL, thử tìm component riêng cho domain đó
  if (url) {
    try {
      const { hostname } = new URL(url);
      const Component = domainComponents[hostname];

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

  // Nếu không có URL, hoặc có URL nhưng không có component riêng,
  // thì hiển thị bảng điều khiển chung.
  return <DefaultPanel executeScript={executeScript} />;
};

export default Panel;
