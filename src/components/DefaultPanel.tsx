// src/components/DefaultPanel.tsx
import React, { useState } from "react";
import PostTools from "./panel-tools/PostTools";
import GetTools from "./panel-tools/GetTools";
import DomTools from "./panel-tools/DomTools";
import JsTools from "./panel-tools/JsTools";
import StorageTools from "./panel-tools/StorageTools";
import "./panel-tools/Tools.css";
import { CapturedPacket } from "../types"; // Import CapturedPacket

interface DefaultPanelProps {
  executeScript: (script: string) => void;
  // Sử dụng kiểu CapturedPacket
  postPackets: CapturedPacket[];
}

const TABS = {
  POST: "POST",
  GET: "GET",
  DOM: "DOM",
  JAVASCRIPT: "JavaScript",
  STORAGE: "Lưu trữ",
};

const DefaultPanel: React.FC<DefaultPanelProps> = ({
  executeScript,
  postPackets,
}) => {
  const [activeTab, setActiveTab] = useState(TABS.POST);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case TABS.POST:
        return <PostTools packets={postPackets} />;
      case TABS.GET:
        return <GetTools executeScript={executeScript} />;
      case TABS.DOM:
        return <DomTools executeScript={executeScript} />;
      case TABS.JAVASCRIPT:
        return <JsTools executeScript={executeScript} />;
      case TABS.STORAGE:
        return <StorageTools executeScript={executeScript} />;
      default:
        return null;
    }
  };

  return (
    <div className="tool-panel">
      <div className="tab-header">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-content">{renderActiveTabContent()}</div>
    </div>
  );
};

export default DefaultPanel;
