// src/components/panel-tools/PostTools.tsx
import React from "react";

interface ToolProps {
  executeScript: (script: string) => void;
}

const PostTools: React.FC<ToolProps> = ({ executeScript }) => {
  return (
    <div>
      <h3>Post Tools</h3>
    </div>
  );
};

export default PostTools;
