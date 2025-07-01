import React, { useState, useRef, useCallback, useEffect } from "react";
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
  isDestroyed: () => boolean;
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
  const webviewRef = useRef<ExtendedWebviewTag | null>(null);

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
    webviewRef.current?.loadURL(finalUrl);
  };

  const handlePaste = async () => {
    const text = await window.ipcRenderer.clipboard.readText();
    setInputValue(text);
    setUrl(text);
    webviewRef.current?.loadURL(text);
  };

  const setWebviewRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        const webviewNode = node as ExtendedWebviewTag;
        webviewRef.current = webviewNode;

        const handleNavigate = (event: Event) => {
          const navEvent = event as unknown as DidNavigateEvent;
          setUrl(navEvent.url);
        };

        const handleDomReady = () => {
          if (!webviewRef.current || webviewRef.current.isDestroyed()) {
            return;
          }

          const webContents = webviewRef.current.getWebContents();
          if (!webContents || webContents.isDestroyed()) {
            return;
          }

          const session = webContents.session;

          // *** THAY ĐỔI QUAN TRỌNG ***
          // 1. Sử dụng ký tự đại diện (*) để bắt mọi URL bắt đầu bằng chuỗi này
          const filter = {
            urls: ["https://audience.ahaslides.com/api/answer/create"],
          };

          // 2. Thêm console.log để gỡ lỗi
          console.log("Đang lắng nghe các yêu cầu mạng đến:", filter.urls);

          session.webRequest.onBeforeRequest(
            filter,
            (
              details: OnBeforeRequestDetails,
              callback: (response: CallbackResponse) => void
            ) => {
              // 3. Log chi tiết request để kiểm tra
              console.log(
                `[BẮT GÓI TIN] Phương thức: ${details.method}, URL: ${details.url}`
              );

              if (details.method === "POST" && details.uploadData) {
                try {
                  const body = details.uploadData[0].bytes;
                  const jsonString = Buffer.from(body).toString("utf8");
                  console.log("[BẮT GÓI TIN] Dữ liệu JSON:", jsonString); // Log dữ liệu thô
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

        node.addEventListener("did-navigate", handleNavigate);
        node.addEventListener("dom-ready", handleDomReady);

        return () => {
          node.removeEventListener("did-navigate", handleNavigate);
          node.removeEventListener("dom-ready", handleDomReady);
          if (webviewRef.current && !webviewRef.current.isDestroyed()) {
            const webContents = webviewRef.current.getWebContents();
            if (webContents && !webContents.isDestroyed()) {
              webContents.session.webRequest.onBeforeRequest(null);
            }
          }
        };
      }
    },
    [setUrl, onJsonCapture]
  );

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
        ref={setWebviewRef as any}
        src={url}
        className="webview"
        partition="temp_session"
      />
    </div>
  );
};

export default Browser;
