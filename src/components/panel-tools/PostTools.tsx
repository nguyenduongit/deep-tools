// src/components/panel-tools/PostTools.tsx
import React from "react";
import { CapturedPacket } from "../../types"; // Import CapturedPacket

// Định nghĩa props cho component, bao gồm danh sách các gói tin
interface PostToolsProps {
  packets: CapturedPacket[];
}

const PostTools: React.FC<PostToolsProps> = ({ packets }) => {
  return (
    <div className="tool-group">
      <h3>Captured POST Packets</h3>
      {packets.length === 0 ? (
        <p>No POST requests with JSON data have been captured yet.</p>
      ) : (
        <div className="packet-list">
          {[...packets].reverse().map((packet) => (
            <div key={packet.id} className="packet-item">
              <div className="packet-header">
                <strong>Packet #{packet.id}</strong> -{" "}
                <span>{packet.timestamp}</span>
              </div>
              <pre className="packet-body">
                {JSON.stringify(packet.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostTools;
