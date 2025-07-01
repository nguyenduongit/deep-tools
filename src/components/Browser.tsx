import React, { useState, useCallback, useEffect } from "react";
import { AnswerPayload } from "../types";

// --- ĐỊNH NGHĨA KIỂU THỦ CÔNG ---
interface OnBeforeRequestDetails {
  id: number;
  url: string;
  method: string;
  webContentsId?: number;
  resourceType: string;
  timestamp: number;
  uploadData?: Electron.UploadData[];
}

interface CallbackResponse {
  cancel?: boolean;
  redirectURL?: string;
}

interface DidNavigateEvent {
  url: string;
}

interface ExtendedWebviewTag extends HTMLElement {
  getWebContents: () => Electron.WebContents;
  // Lưu ý: isDestroyed() là của webContents, không phải của webview tag
  loadURL: (url: string) => Promise<void>;
}
// --- KẾT THÚC ĐỊNH NGHĨA KIỂU THỦ CÔNG ---

interface BrowserProps {
  url: string;
  setUrl: (url: string) => void;
  onJsonCapture: (data: AnswerPayload) => void;
}

const Browser: React.FC<BrowserProps> = ({ url, setUrl, onJsonCapture }) => {
  const [inputValue, setInputValue] = useState(url);
  const [partitionKey] = useState(`temp_session_${Date.now()}`);
  const [webviewNode, setWebviewNode] = useState<ExtendedWebviewTag | null>(
    null
  );

  // Callback ref để lấy DOM node của webview và lưu vào state
  // Điều này sẽ kích hoạt useEffect bên dưới khi node được gắn vào.
  const webviewCallbackRef = useCallback((node: ExtendedWebviewTag | null) => {
    if (node) {
      setWebviewNode(node);
    }
  }, []);

  useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalUrl = inputValue;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    setUrl(finalUrl);
    webviewNode?.loadURL(finalUrl);
  };

  const handlePaste = async () => {
    const text = await window.ipcRenderer.clipboard.readText();
    setInputValue(text);
    setUrl(text);
    webviewNode?.loadURL(text);
  };

  // useEffect để quản lý các event listener và cleanup
  useEffect(() => {
    if (!webviewNode) {
      return;
    }

    const handleNavigate = (event: Event) => {
      const navEvent = event as unknown as DidNavigateEvent;
      setUrl(navEvent.url);
    };

    const handleDomReady = () => {
      // SỬA LỖI: Lấy webContents ra trước khi kiểm tra
      const webContents = webviewNode.getWebContents();
      if (!webContents || webContents.isDestroyed()) {
        return;
      }

      const session = webContents.session;
      const filter = {
        urls: ["https://audience.ahaslides.com/api/answer/create"],
      };

      console.log("Đang lắng nghe các yêu cầu mạng đến:", filter.urls);

      session.webRequest.onBeforeRequest(
        filter,
        (
          details: OnBeforeRequestDetails,
          callback: (response: CallbackResponse) => void
        ) => {
          console.log(
            `[BẮT GÓI TIN] Phương thức: ${details.method}, URL: ${details.url}`
          );

          if (details.method === "POST" && details.uploadData) {
            try {
              const body = details.uploadData[0].bytes;
              const jsonString = Buffer.from(body).toString("utf8");
              console.log("[BẮT GÓI TIN] Dữ liệu JSON:", jsonString);
              const jsonData = JSON.parse(jsonString) as AnswerPayload;
              onJsonCapture(jsonData);
            } catch (error) {
              console.error("Lỗi khi phân tích body của request:", error);
            }
          }
          callback({});
        }
      );
    };

    webviewNode.addEventListener("did-navigate", handleNavigate);
    webviewNode.addEventListener("dom-ready", handleDomReady);

    // Hàm cleanup sẽ được gọi khi component unmount
    return () => {
      webviewNode.removeEventListener("did-navigate", handleNavigate);
      webviewNode.removeEventListener("dom-ready", handleDomReady);

      const webContents = webviewNode.getWebContents();
      if (webContents && !webContents.isDestroyed()) {
        webContents.session.webRequest.onBeforeRequest(null);
      }
    };
  }, [webviewNode, onJsonCapture, setUrl]); // Effect này sẽ chạy lại khi webviewNode thay đổi

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
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <webview
        ref={webviewCallbackRef as any}
        src={url}
        className="webview"
        partition={partitionKey}
      />
    </div>
  );
};

export default Browser;
