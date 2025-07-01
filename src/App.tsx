// src/App.tsx

import { useState } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload } from "./types";
import AddressBar from "./components/AddressBar"; // Import component mới

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

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
        <Browser url={currentUrl} onJsonCapture={handleJsonCapture} />
        {isPanelVisible && (
          <Panel url={currentUrl} capturedJson={capturedJson} />
        )}
      </div>
    </div>
  );
}

export default App;
