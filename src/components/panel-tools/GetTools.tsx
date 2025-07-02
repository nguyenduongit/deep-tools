// src/components/panel-tools/GetTools.tsx
import React from "react";

interface ToolProps {
  executeScript: (script: string) => void;
}

const GetTools: React.FC<ToolProps> = ({ executeScript }) => {
  return (
    <div>
      <h3>Get Tools</h3>
    </div>
  );
};

export default GetTools;
