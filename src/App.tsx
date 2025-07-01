import { useState, useRef } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload } from "./types";
import AddressBar from "./components/AddressBar";

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // Tạo một ref để giữ tham chiếu đến component Browser
  const browserRef = useRef<{ executeJavaScript: (script: string) => void }>(
    null
  );

  const handleJsonCapture = (data: AnswerPayload) => {
    setCapturedJson({ ...data, timestamp: new Date().getTime() });
  };

  const handleSetUrl = (url: string) => {
    if (url) {
      let finalUrl = url;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
      setCurrentUrl(finalUrl);
    } else {
      setCurrentUrl("");
    }
  };

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  // Hàm để panel gọi và thực thi script trên webview
  const executeScriptInWebview = (script: string) => {
    browserRef.current?.executeJavaScript(script);
  };

  return (
    <div className="app-layout">
      <AddressBar
        url={currentUrl}
        setUrl={handleSetUrl}
        isPanelVisible={isPanelVisible}
        togglePanel={togglePanel}
      />
      <div
        className={`content-area ${
          isPanelVisible ? "panel-visible" : "panel-hidden"
        }`}
      >
        <Browser
          ref={browserRef} // Gán ref cho Browser
          url={currentUrl}
          onJsonCapture={handleJsonCapture}
        />
        {isPanelVisible && (
          <Panel
            url={currentUrl}
            capturedJson={capturedJson}
            // Truyền hàm thực thi xuống Panel
            executeScript={executeScriptInWebview}
          />
        )}
      </div>
    </div>
  );
}

export default App;
