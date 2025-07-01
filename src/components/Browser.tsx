import React, { useState, useEffect, useRef } from "react";
import { AnswerPayload } from "../types";
import Home from "./Home"; // Đảm bảo đã import component Home

interface BrowserProps {
  url: string;
  setUrl: (url: string) => void;
  onJsonCapture: (data: AnswerPayload) => void;
}

type WebviewElement = Electron.WebviewTag;

const Browser: React.FC<BrowserProps> = ({ url, setUrl, onJsonCapture }) => {
  const [inputValue, setInputValue] = useState(url);
  const [partitionKey] = useState(`temp_session_${Date.now()}`);
  const webviewRef = useRef<WebviewElement | null>(null);

  // Đồng bộ giá trị của thanh địa chỉ với url từ App
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
    setUrl(""); // Đặt URL thành rỗng để hiển thị trang chủ
  };

  useEffect(() => {
    const webviewNode = webviewRef.current;
    if (!webviewNode) return;

    const handleNavigate = (event: Event & { url: string }) => {
      // Cập nhật thanh địa chỉ khi người dùng điều hướng bên trong webview
      if (event.url !== "about:blank") {
        setInputValue(event.url);
      }
    };

    const handleDomReady = () => {
      const webviewContentsId = webviewNode.getWebContentsId();
      window.ipcRenderer.invoke("set-request-listener", webviewContentsId);
    };

    webviewNode.addEventListener("did-navigate", handleNavigate);
    webviewNode.addEventListener("dom-ready", handleDomReady);

    return () => {
      webviewNode.removeEventListener("did-navigate", handleNavigate);
      webviewNode.removeEventListener("dom-ready", handleDomReady);
    };
  }, [url]);

  useEffect(() => {
    const handleJsonCaptured = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => {
      const jsonData = args[0] as AnswerPayload;
      onJsonCapture(jsonData);
    };

    const unsubscribe = window.ipcRenderer.on(
      "json-captured",
      handleJsonCaptured
    );
    return () => unsubscribe();
  }, [onJsonCapture]);

  return (
    <div className="browser">
      <div className="address-bar">
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

      {url ? (
        <webview
          ref={webviewRef}
          src={url}
          className="webview"
          partition={partitionKey}
          allowpopups="true"
        />
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Home />
        </div>
      )}
    </div>
  );
};

export default Browser;
