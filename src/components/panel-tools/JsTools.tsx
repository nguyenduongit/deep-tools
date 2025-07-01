// src/components/panel-tools/JsTools.tsx
import React from "react";

interface ToolProps {
  executeScript: (script: string) => void;
}

const JsTools: React.FC<ToolProps> = ({ executeScript }) => {
  const disableTimers = () => {
    const script = `
      window.setTimeout = () => console.log('setTimeout has been disabled.');
      window.setInterval = () => console.log('setInterval has been disabled.');
      alert('Tất cả các hàm setTimeout và setInterval đã bị vô hiệu hóa.');
    `;
    executeScript(script);
  };

  return (
    <div className="tool-group">
      <h3>Can Thiệp JavaScript</h3>
      <button onClick={disableTimers}>Tắt bộ đếm thời gian (Timers)</button>
    </div>
  );
};

export default JsTools;
