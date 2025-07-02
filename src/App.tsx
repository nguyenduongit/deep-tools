import { useState, useRef, useEffect } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload, CapturedPacket } from "./types";
import AddressBar from "./components/AddressBar";
import { domainComponents } from "./components/domains";

function App() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [useDefaultPanel, setUseDefaultPanel] = useState(true);

  const [postPackets, setPostPackets] = useState<CapturedPacket[]>([]);
  const packetCounter = useRef(0);

  const browserRef = useRef<{ executeJavaScript: (script: string) => void }>(
    null
  );

  useEffect(() => {
    const handleJsonCaptured = (
      _event: Electron.IpcRendererEvent,
      ...args: unknown[]
    ) => {
      const data = args[0] as AnswerPayload; // Ép kiểu dữ liệu nhận được

      const newPacket: CapturedPacket = {
        id: ++packetCounter.current,
        data: data,
        timestamp: new Date().toLocaleTimeString(),
      };
      setPostPackets((prevPackets) => [...prevPackets, newPacket]);

      setCapturedJson({ ...data, timestamp: new Date().getTime() });
    };

    const unsubscribe = window.ipcRenderer.on(
      "json-captured",
      handleJsonCaptured
    );
    return () => unsubscribe();
  }, []);

  const handleSetUrl = (url: string) => {
    if (url) {
      let finalUrl = url;
      if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
        finalUrl = "https://" + finalUrl;
      }
      setCurrentUrl(finalUrl);
      try {
        const { hostname } = new URL(finalUrl);
        setUseDefaultPanel(!domainComponents[hostname]);
      } catch (error) {
        setUseDefaultPanel(true);
      }
    } else {
      setCurrentUrl("");
      setUseDefaultPanel(true);
    }
  };

  const togglePanel = () => setIsPanelVisible(!isPanelVisible);
  const togglePanelType = () => setUseDefaultPanel(!useDefaultPanel);
  const executeScriptInWebview = (script: string) =>
    browserRef.current?.executeJavaScript(script);
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
          onJsonCapture={() => {
            /* No-op */
          }}
        />
        {isPanelVisible && (
          <Panel
            url={currentUrl}
            capturedJson={capturedJson}
            executeScript={executeScriptInWebview}
            useDefaultPanel={useDefaultPanel}
            postPackets={postPackets}
          />
        )}
      </div>
    </div>
  );
}

export default App;
