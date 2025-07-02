import React from "react";
import { domainComponents } from "./domains";
import { AnswerPayload, CapturedPacket } from "../types"; // Import CapturedPacket
import DefaultPanel from "./DefaultPanel";

interface PanelProps {
  url: string;
  capturedJson: (AnswerPayload & { timestamp: number }) | null;
  executeScript: (script: string) => void;
  useDefaultPanel: boolean;
  // Sử dụng kiểu CapturedPacket
  postPackets: CapturedPacket[];
}

const Panel: React.FC<PanelProps> = ({
  url,
  capturedJson,
  executeScript,
  useDefaultPanel,
  postPackets,
}) => {
  if (url && !useDefaultPanel) {
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

  return (
    <DefaultPanel executeScript={executeScript} postPackets={postPackets} />
  );
};

export default Panel;
