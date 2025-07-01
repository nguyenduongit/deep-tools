// src/components/panel-tools/DomTools.tsx
import React from "react";

interface ToolProps {
  executeScript: (script: string) => void;
}

const DomTools: React.FC<ToolProps> = ({ executeScript }) => {
  const enableAllButtons = () => {
    const script = `
      let count = 0;
      document.querySelectorAll('button[disabled], input[type="button"][disabled]').forEach(el => {
        el.disabled = false;
        el.style.cursor = 'pointer';
        el.style.opacity = '1';
        count++;
      });
      alert(count + ' elements have been re-enabled.');
    `;
    executeScript(script);
  };

  const showHiddenElements = () => {
    const script = `
      let count = 0;
      document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"], .hidden, .invisible').forEach(el => {
        el.style.display = 'block';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.classList.remove('hidden', 'invisible');
        count++;
      });
      alert(count + ' hidden elements may have been revealed.');
    `;
    executeScript(script);
  };

  const enableContentEditing = () => {
    const script = `
      const isEditable = document.body.contentEditable === 'true';
      document.body.contentEditable = !isEditable;
      alert('Chế độ chỉnh sửa nội dung đã ' + (!isEditable ? 'BẬT' : 'TẮT'));
    `;
    executeScript(script);
  };

  return (
    <div className="tool-group">
      <h3>Can Thiệp Giao Diện (DOM)</h3>
      <button onClick={enableAllButtons}>
        Kích hoạt phần tử bị vô hiệu hóa
      </button>
      <button onClick={showHiddenElements}>Hiển thị thành phần ẩn</button>
      <button onClick={enableContentEditing}>Bật/Tắt chế độ sửa văn bản</button>
    </div>
  );
};

export default DomTools;
