import { useState } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload } from "./types"; // Import kiểu mới

function App() {
  const [currentUrl, setCurrentUrl] = useState(
    "https://audience.ahaslides.com/d7loturvdk"
  );
  // Sử dụng kiểu AnswerPayload thay vì any
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);

  // Định kiểu cho tham số data
  const handleJsonCapture = (data: AnswerPayload) => {
    setCapturedJson({ ...data, timestamp: new Date().getTime() });
  };

  return (
    <>
      <Browser
        url={currentUrl}
        setUrl={setCurrentUrl}
        onJsonCapture={handleJsonCapture}
      />
      <Panel url={currentUrl} capturedJson={capturedJson} />
    </>
  );
}

export default App;
