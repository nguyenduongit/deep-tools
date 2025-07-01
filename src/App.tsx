import { useState } from "react";
import "./App.css";
import Browser from "./components/Browser";
import Panel from "./components/Panel";
import { AnswerPayload } from "./types";

function App() {
  // Bắt đầu với URL trống để hiển thị trang chủ mặc định
  const [currentUrl, setCurrentUrl] = useState("");
  const [capturedJson, setCapturedJson] = useState<
    (AnswerPayload & { timestamp: number }) | null
  >(null);

  const handleJsonCapture = (data: AnswerPayload) => {
    setCapturedJson({ ...data, timestamp: new Date().getTime() });
  };

  /**
   * Cập nhật URL.
   * - Nếu có URL, chuẩn hóa và đặt nó.
   * - Nếu URL rỗng, sẽ hiển thị trang chủ.
   * @param url - Chuỗi URL hoặc chuỗi rỗng.
   */
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

  return (
    // Bố cục 2 cột luôn được giữ nguyên
    <>
      <Browser
        url={currentUrl}
        setUrl={handleSetUrl}
        onJsonCapture={handleJsonCapture}
      />
      <Panel url={currentUrl} capturedJson={capturedJson} />
    </>
  );
}

export default App;
