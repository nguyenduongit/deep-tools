// src/components/DefaultPanel.tsx
import React, { useState } from "react";
import DomTools from "./panel-tools/DomTools";
import JsTools from "./panel-tools/JsTools";
import StorageTools from "./panel-tools/StorageTools";
import "./panel-tools/Tools.css"; // Import file CSS chung cho các công cụ

interface DefaultPanelProps {
  executeScript: (script: string) => void;
}

// Định nghĩa các tab
const TABS = {
  DOM: "DOM",
  JAVASCRIPT: "JavaScript",
  STORAGE: "Lưu trữ",
};

const DefaultPanel: React.FC<DefaultPanelProps> = ({ executeScript }) => {
  const [activeTab, setActiveTab] = useState(TABS.DOM);

  const renderActiveTabContent = () => {
    switch (activeTab) {
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
