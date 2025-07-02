import React, { useState, useEffect } from "react";

interface AddressBarProps {
  url: string;
  setUrl: (url: string) => void;
  isPanelVisible: boolean;
  togglePanel: () => void;
  useDefaultPanel: boolean;
  togglePanelType: () => void;
  hasPersonalPanel: boolean;
}

const AddressBar: React.FC<AddressBarProps> = ({
  url,
  setUrl,
  isPanelVisible,
  togglePanel,
  useDefaultPanel,
  togglePanelType,
  hasPersonalPanel,
}) => {
  const [inputValue, setInputValue] = useState(url);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrl(inputValue);
  };

  const handlePaste = async () => {
    try {
      const text = await window.ipcRenderer.clipboard.readText();
      if (text) {
        setInputValue(text);
        setUrl(text);
      }
    } catch (error) {
      console.error("Failed to read from clipboard:", error);
    }
  };

  const navigateToHome = () => {
    setUrl("");
  };

  return (
    <div className="address-bar-full">
      <div className="address-bar-main">
        <button id="home-button" onClick={navigateToHome}>
          🏠
        </button>
        <form onSubmit={handleUrlSubmit} style={{ display: "flex", flex: 1 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Nhập URL và nhấn Enter"
          />
        </form>
        <button onClick={handlePaste}>Paste</button>
      </div>
      <div className="address-bar-tools">
        <button onClick={togglePanel} className="panel-toggle-button">
          {isPanelVisible ? "Close panel" : "Open panel"}
        </button>
        {/* Nút chuyển đổi panel, chỉ hiển thị khi có panel cá nhân và panel đang mở */}
        {isPanelVisible && hasPersonalPanel && (
          <button onClick={togglePanelType} className="panel-toggle-button">
            {useDefaultPanel ? "Personal panel" : "Default panel"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressBar;
