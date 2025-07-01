import React, { useState, useRef, useCallback } from "react";

const Browser = () => {
  const [url, setUrl] = useState("https://www.google.com");
  const webviewRef = useRef<Electron.WebviewTag | null>(null);

  // Sử dụng callback ref để gán phần tử webview vào webviewRef.current
  const setWebviewRef = useCallback((node: Electron.WebviewTag | null) => {
    if (node) {
      // Khi thẻ webview được tạo, thêm các event listener
      node.addEventListener("dom-ready", () => {
        // Bạn có thể bỏ comment dòng dưới để mở DevTools cho webview
        // node.openDevTools();
      });
      webviewRef.current = node; // Lưu lại tham chiếu
    }
  }, []); // Callback này chỉ được tạo một lần

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (webviewRef.current) {
      webviewRef.current.loadURL(url);
    }
  };

  const handlePaste = async () => {
    const text = await window.ipcRenderer.clipboard.readText();
    setUrl(text);
    if (webviewRef.current) {
      webviewRef.current.loadURL(text);
    }
  };

  return (
    <div className="browser">
      <div className="address-bar">
        <form onSubmit={handleUrlSubmit} style={{ display: "flex", flex: 1 }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL"
          />
        </form>
        <button onClick={handlePaste}>Paste</button>
      </div>
      {/* Gán callback ref cho thẻ webview */}
      <webview ref={setWebviewRef} src={url} className="webview" />
    </div>
  );
};

export default Browser;
