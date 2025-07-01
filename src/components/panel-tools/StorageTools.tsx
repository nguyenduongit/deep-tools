// src/components/panel-tools/StorageTools.tsx
import React from "react";

interface ToolProps {
  executeScript: (script: string) => void;
}

const StorageTools: React.FC<ToolProps> = ({ executeScript }) => {
  const clearAllStorage = () => {
    const script = `
      localStorage.clear();
      sessionStorage.clear();
      alert('Đã xóa toàn bộ localStorage và sessionStorage.');
    `;
    executeScript(script);
  };

  return (
    <div className="tool-group">
      <h3>Quản Lý Lưu Trữ</h3>
      <button onClick={clearAllStorage}>Xóa Local & Session Storage</button>
      {/* Các chức năng xem/sửa cookies, storage sẽ được thêm ở đây */}
      <p style={{ marginTop: "10px", fontStyle: "italic" }}>
        Chức năng xem và chỉnh sửa chi tiết sẽ được phát triển sau.
      </p>
    </div>
  );
};

export default StorageTools;
