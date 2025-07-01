import React, { useState } from "react";
import { VotePayload } from "../../types"; // Sử dụng VotePayload

// Định nghĩa kiểu cho props
interface AhaSlidesProps {
  url: string;
  capturedJson: (VotePayload & { timestamp: number }) | null; // Sử dụng VotePayload
}

// Hàm này tạo ra một ID ngẫu nhiên cho audience
function generateRandomAudienceId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const AhaSlides: React.FC<AhaSlidesProps> = ({ url, capturedJson }) => {
  const [voteCount, setVoteCount] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const urlParts = url.split("/");
  const ahaslidesId = urlParts[urlParts.length - 1];

  const handleSendVotes = async () => {
    if (!capturedJson || isSending) {
      if (!capturedJson) {
        setStatusMessage(
          "Chưa có gói tin nào được bắt. Vui lòng thực hiện một bình chọn trong trình duyệt để bắt đầu."
        );
      }
      return;
    }

    setIsSending(true);
    setStatusMessage(`Đang gửi ${voteCount} lượt bình chọn...`);

    const apiUrl = "https://audience.ahaslides.com/api/answer/create";
    let successfulVotes = 0;
    const errors: string[] = [];

    for (let i = 0; i < voteCount; i++) {
      // Tạo một payload mới cho mỗi lần gửi
      const payload: VotePayload = {
        ...capturedJson, // Sao chép các giá trị gốc từ gói tin đã bắt
        audience: generateRandomAudienceId(), // Tạo audience ID mới, duy nhất
        slideTimestamp: Date.now().toString(), // Tạo timestamp mới, duy nhất
      };

      // Xóa timestamp cũ nếu có để tránh xung đột
      delete payload.timestamp;

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          successfulVotes++;
        } else {
          const errorText = await response.text();
          errors.push(`Lỗi ${response.status}: ${errorText}`);
        }
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Lỗi mạng: ${error.message}`);
        } else {
          errors.push(`Lỗi không xác định: ${String(error)}`);
        }
      }

      // Thêm một khoảng trễ nhỏ giữa các yêu cầu
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    let finalMessage = `Hoàn thành! Gửi thành công ${successfulVotes}/${voteCount} phiếu.`;
    if (errors.length > 0) {
      finalMessage += `\n\nChi tiết một số lỗi (tối đa 5):\n${errors
        .slice(0, 5)
        .join("\n")}`;
    }

    setStatusMessage(finalMessage);
    setIsSending(false);
  };

  return (
    <div>
      <h2>AhaSlides Panel - Gửi Bình Chọn Hàng Loạt</h2>
      <p>Nội dung cho AhaSlides ID: {ahaslidesId}</p>
      {capturedJson ? (
        <>
          <h4>Gói tin đã bắt được (dùng làm mẫu):</h4>
          <pre
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "#f0f0f0",
              padding: "10px",
              borderRadius: "4px",
            }}
          >
            {JSON.stringify(capturedJson, null, 2)}
          </pre>
          <div>
            <label htmlFor="vote-count">Số lượng phiếu gửi:</label>
            <input
              id="vote-count"
              type="number"
              value={voteCount}
              onChange={(e) => setVoteCount(parseInt(e.target.value, 10))}
              min="1"
              disabled={isSending}
              style={{ marginLeft: "10px", width: "80px" }}
            />
          </div>
          <button
            onClick={handleSendVotes}
            disabled={isSending}
            style={{ marginTop: "10px" }}
          >
            {isSending ? "Đang gửi..." : `Gửi ${voteCount} bình chọn`}
          </button>
        </>
      ) : (
        <p>Đang chờ bắt gói tin bình chọn từ trình duyệt...</p>
      )}
      {statusMessage && (
        <div style={{ marginTop: "15px", whiteSpace: "pre-wrap" }}>
          <strong>Trạng thái:</strong>
          <p>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AhaSlides;
