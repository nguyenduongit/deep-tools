// src/components/Browser.tsx

import React, { useState, useEffect, useRef } from "react";
import { AnswerPayload } from "../types";

// Bỏ các định nghĩa kiểu thủ công không còn cần thiết

interface BrowserProps {
  url: string;
  setUrl: (url: string) => void;
  onJsonCapture: (data: AnswerPayload) => void;
}

// Định nghĩa lại kiểu cho webview tag để bao gồm các thuộc tính cần thiết
// mà không cần khai báo lại toàn bộ.
type WebviewElement = Electron.WebviewTag;

const Browser: React.FC<BrowserProps> = ({ url, setUrl, onJsonCapture }) => {
  const [inputValue, setInputValue] = useState(url);
  const [partitionKey] = useState(`temp_session_${Date.now()}`);
  const webviewRef = useRef<WebviewElement | null>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputValue;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    setUrl(finalUrl);
    webviewRef.current?.loadURL(finalUrl);
  };

  const handlePaste = async () => {
    try {
      const text = await window.ipcRenderer.clipboard.readText();
      if (text) {
        setInputValue(text);
        setUrl(text);
        webviewRef.current?.loadURL(text);
      }
    } catch (error) {
      console.error("Failed to read from clipboard:", error);
    }
  };

  // useEffect để quản lý các event listener và cleanup cho webview
  useEffect(() => {
    const webviewNode = webviewRef.current;
    if (!webviewNode) {
      return;
    }

    const handleNavigate = (event: Event & { url: string }) => {
      setUrl(event.url);
    };

    const handleDomReady = () => {
      const webviewContentsId = webviewNode.getWebContentsId();
      console.log(`[RENDERER] Webview DOM ready, ID: ${webviewContentsId}`);
      // Gửi ID của webview đến main process để thiết lập listener
      window.ipcRenderer.invoke("set-request-listener", webviewContentsId);
    };

    // Thêm event listeners
    webviewNode.addEventListener("did-navigate", handleNavigate);
    webviewNode.addEventListener("dom-ready", handleDomReady);

    // Hàm cleanup sẽ được gọi khi component unmount hoặc webviewNode thay đổi
    return () => {
      webviewNode.removeEventListener("did-navigate", handleNavigate);
      webviewNode.removeEventListener("dom-ready", handleDomReady);
    };
  }, [setUrl]); // Chỉ chạy một lần khi component mount

  // useEffect để lắng nghe dữ liệu JSON được gửi từ main process
  useEffect(() => {
    // Thay đổi quan trọng ở đây
    const handleJsonCaptured = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => {
      // Lấy dữ liệu từ tham số đầu tiên và ép kiểu thành AnswerPayload
      const jsonData = args[0] as AnswerPayload;
      console.log("[RENDERER] Nhận được dữ liệu JSON:", jsonData);
      onJsonCapture(jsonData);
    };

    const unsubscribe = window.ipcRenderer.on(
      "json-captured",
      handleJsonCaptured
    );

    // Dọn dẹp listener khi component unmount
    return () => {
      unsubscribe();
    };
  }, [onJsonCapture]);

  return (
    <div className="browser">
      <div className="address-bar">
        <form onSubmit={handleUrlSubmit} style={{ display: "flex", flex: 1 }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter URL"
          />
        </form>
        <button onClick={handlePaste}>Paste</button>
      </div>
      <webview
        ref={webviewRef}
        src={url}
        className="webview"
        partition={partitionKey}
      />
    </div>
  );
};

export default Browser;
