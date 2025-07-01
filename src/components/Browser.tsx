import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { AnswerPayload } from "../types";
import Home from "./Home";

interface BrowserProps {
  url: string;
  onJsonCapture: (data: AnswerPayload) => void;
}

type WebviewElement = Electron.WebviewTag;

const Browser = forwardRef<
  { executeJavaScript: (script: string) => void },
  BrowserProps
>(({ url, onJsonCapture }, ref) => {
  const [partitionKey] = React.useState(`temp_session_${Date.now()}`);
  const webviewRef = useRef<WebviewElement | null>(null);

  // Expose phương thức để component cha có thể gọi
  useImperativeHandle(ref, () => ({
    executeJavaScript(script: string) {
      if (webviewRef.current) {
        webviewRef.current.executeJavaScript(script);
      } else {
        console.warn("Webview is not available to execute script.");
      }
    },
  }));

  // ... (phần còn lại của component giữ nguyên)

  useEffect(() => {
    const webviewNode = webviewRef.current;
    if (!webviewNode) return;

    const handleDomReady = () => {
      const webviewContentsId = webviewNode.getWebContentsId();
      window.ipcRenderer.invoke("set-request-listener", webviewContentsId);
    };

    webviewNode.addEventListener("dom-ready", handleDomReady);

    return () => {
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
});

export default Browser;
