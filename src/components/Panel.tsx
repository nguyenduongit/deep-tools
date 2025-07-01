import React from "react";
import { domainComponents } from "./domains";
import { AnswerPayload } from "../types"; // Import kiểu mới

interface PanelProps {
  url: string;
  capturedJson: (AnswerPayload & { timestamp: number }) | null; // Sử dụng kiểu mới
}

// ... (phần còn lại của file giữ nguyên)
const DefaultPanel = () => (
  <div className="panel" style={{ padding: "20px" }}>
    <h2>Panel mặc định</h2>
    <p>Chưa có component nào được định nghĩa cho tên miền này.</p>
  </div>
);

const Panel: React.FC<PanelProps> = ({ url, capturedJson }) => {
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

  return <DefaultPanel />;
};

export default Panel;
