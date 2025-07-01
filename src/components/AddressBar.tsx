// src/components/AddressBar.tsx

import React, { useState, useEffect } from "react";

interface AddressBarProps {
  url: string;
  setUrl: (url: string) => void;
  isPanelVisible: boolean;
  togglePanel: () => void;
}

const AddressBar: React.FC<AddressBarProps> = ({
  url,
  setUrl,
  isPanelVisible,
  togglePanel,
}) => {
  const [inputValue, setInputValue] = useState(url);

  // Cập nhật giá trị input khi url prop thay đổi
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
    setUrl(""); // Đặt URL về rỗng để hiển thị trang chủ
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
        {/* Nút đóng mở panel */}
        <button onClick={togglePanel} className="panel-toggle-button">
          {isPanelVisible ? "Close" : "Open"}
        </button>
        {/* Thêm các nút công cụ khác ở đây */}
      </div>
    </div>
  );
};

export default AddressBar;
