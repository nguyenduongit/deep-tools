import { useState, useRef } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload } from "./types";
import AddressBar from "./components/AddressBar";
import { domainComponents } from "./components/domains";

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [useDefaultPanel, setUseDefaultPanel] = useState(true); // true để mặc định là DefaultPanel

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
      // Khi URL thay đổi, kiểm tra và quyết định panel
      try {
        const { hostname } = new URL(finalUrl);
        // Nếu có panel riêng, mặc định hiển thị nó
        if (domainComponents[hostname]) {
          setUseDefaultPanel(false);
        } else {
          // Nếu không, hiển thị panel mặc định
          setUseDefaultPanel(true);
        }
      } catch (error) {
        // Nếu URL không hợp lệ, hiển thị panel mặc định
        setUseDefaultPanel(true);
      }
    } else {
      setCurrentUrl("");
      // Nếu không có URL, hiển thị panel mặc định
      setUseDefaultPanel(true);
    }
  };

  const togglePanel = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  // Hàm chuyển đổi giữa panel mặc định và panel cá nhân
  const togglePanelType = () => {
    setUseDefaultPanel(!useDefaultPanel);
  };

  const executeScriptInWebview = (script: string) => {
    browserRef.current?.executeJavaScript(script);
  };

  // Hàm kiểm tra xem có panel cá nhân cho URL hiện tại không
  const hasPersonalPanel = () => {
    if (!currentUrl) return false;
    try {
      const { hostname } = new URL(currentUrl);
      return !!domainComponents[hostname];
    } catch {
      return false;
    }
  };

  return (
    <div className="app-layout">
      <AddressBar
        url={currentUrl}
        setUrl={handleSetUrl}
        isPanelVisible={isPanelVisible}
        togglePanel={togglePanel}
        useDefaultPanel={useDefaultPanel}
        togglePanelType={togglePanelType}
        hasPersonalPanel={hasPersonalPanel()}
      />
      <div
        className={`content-area ${
          isPanelVisible ? "panel-visible" : "panel-hidden"
        }`}
      >
        <Browser
          ref={browserRef}
          url={currentUrl}
          onJsonCapture={handleJsonCapture}
        />
        {isPanelVisible && (
          <Panel
            url={currentUrl}
            capturedJson={capturedJson}
            executeScript={executeScriptInWebview}
            useDefaultPanel={useDefaultPanel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
