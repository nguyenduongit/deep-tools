import React, { useEffect, useState } from "react";
import { AnswerPayload } from "../../types"; // Import kiểu mới

// Định nghĩa kiểu cho props
interface AhaSlidesProps {
  url: string;
  capturedJson: (AnswerPayload & { timestamp: number }) | null;
}

const AhaSlides: React.FC<AhaSlidesProps> = ({ url, capturedJson }) => {
  // Sử dụng kiểu mới cho state
  const [answers, setAnswers] = useState<
    (AnswerPayload & { timestamp: number })[]
  >([]);

  useEffect(() => {
    if (capturedJson) {
      setAnswers((prevAnswers) => [...prevAnswers, capturedJson]);
    }
  }, [capturedJson]);

  const urlParts = url.split("/");
  const ahaslidesId = urlParts[urlParts.length - 1];

  return (
    <div>
      <h2>AhaSlides Panel</h2>
      <p>Nội dung cho AhaSlides ID: {ahaslidesId}</p>

      <h3>Các câu trả lời đã bắt được:</h3>
      {answers.length > 0 ? (
        <pre
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            backgroundColor: "#f0f0f0",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {JSON.stringify(answers, null, 2)}
        </pre>
      ) : (
        <p>Chưa có câu trả lời nào được ghi nhận.</p>
      )}
    </div>
  );
};

export default AhaSlides;
