// src/components/Browser.tsx

import React, { useEffect, useRef } from "react";
import { AnswerPayload } from "../types";
import Home from "./Home";

interface BrowserProps {
  url: string;
  onJsonCapture: (data: AnswerPayload) => void;
}

type WebviewElement = Electron.WebviewTag;

const Browser: React.FC<BrowserProps> = ({ url, onJsonCapture }) => {
  const [partitionKey] = React.useState(`temp_session_${Date.now()}`);
  const webviewRef = useRef<WebviewElement | null>(null);

  useEffect(() => {
    const webviewNode = webviewRef.current;
    if (!webviewNode) return;

    // Cần giữ lại listener này để truyền webview id lên main process
    const handleDomReady = () => {
      const webviewContentsId = webviewNode.getWebContentsId();
      window.ipcRenderer.invoke("set-request-listener", webviewContentsId);
    };

    // did-navigate không cần thiết ở đây nữa vì input đã được chuyển đi
    webviewNode.addEventListener("dom-ready", handleDomReady);

    return () => {
      webviewNode.removeEventListener("dom-ready", handleDomReady);
    };
  }, [url]); // Listener cần được set lại khi url thay đổi -> webview được tạo lại

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
      {url ? (
        <webview
          ref={webviewRef}
          src={url}
          className="webview"
          partition={partitionKey}
          allowpopups="true"
        />
      ) : (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            height: "100%",
          }}
        >
          <Home />
        </div>
      )}
    </div>
  );
};

export default Browser;
