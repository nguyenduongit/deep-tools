import {
  createClient,
  SupabaseClient,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import fetch from "node-fetch";
import {
  VotePayload,
  AudienceData,
} from "../../src/components/domains/ahaslides/types";

// ---- CÁC KIỂU DỮ LIỆU ----

interface SlideOptionInfo {
  id: number;
  title: string;
  votesCount: number;
}

interface InternalVoteDetails {
  presentationId: number;
  slideId: number;
  accessCode: string;
  slideTimestamp: string;
  type: string;
  config: {
    timeToAnswer: number;
    multipleChoice: boolean;
    isCorrectGetPoint: boolean;
    stopSubmission: boolean;
    fastAnswerGetMorePoint: boolean;
    showVotingResultsOnAudience: boolean;
    version: number;
  };
}

interface SessionData {
  question: string;
  options: SlideOptionInfo[];
  internalDetails: InternalVoteDetails;
}

interface RemoteSession {
  id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  request_url?: string;
  session_data?: SessionData;
  execution_command?: {
    targetId: number;
    count: number;
  };
  progress_log?: string;
}

// ---- BIẾN MÔI TRƯỜNG ----
const SUPABASE_URL = "https://klkqhcmvsfcbindhodru.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtsa3FoY212c2ZjYmluZGhvZHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzI2OTksImV4cCI6MjA2NzA0ODY5OX0.zgYtYET9saIdLGPeSvvWUdn8NQ5VUQ9ULmhynedHqvQ";

let supabase: SupabaseClient;

export function initializeRemoteWorker() {
  if (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_URL.includes("YOUR_SUPABASE_URL")
  ) {
    console.error(
      "LỖI: Vui lòng cung cấp SUPABASE_URL và SUPABASE_ANON_KEY hợp lệ trong electron/remote/worker.ts"
    );
    return;
  }

  console.log("Khởi tạo Remote Worker...");
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  listenToChanges();
}

function listenToChanges() {
  supabase
    .channel("remote_sessions")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "remote_sessions" },
      // SỬA LỖI: Thay thế 'any' bằng kiểu 'RemoteSession' đã định nghĩa
      (payload: RealtimePostgresChangesPayload<RemoteSession>) => {
        console.log("Nhận được thay đổi từ Supabase:", payload);
        handleIncomingPayload(payload);
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log(">>> Đã kết nối và lắng nghe lệnh từ xa!");
      } else if (err) {
        console.error("Lỗi kết nối Supabase Realtime:", err);
      }
    });
}

async function handleIncomingPayload(
  payload: RealtimePostgresChangesPayload<RemoteSession>
) {
  if (payload.eventType !== "INSERT" && payload.eventType !== "UPDATE") {
    return;
  }

  const session = payload.new;

  try {
    if (payload.eventType === "INSERT" && session.status === "url_submitted") {
      await processNewUrl(session);
    } else if (
      payload.eventType === "UPDATE" &&
      session.status === "execution_triggered"
    ) {
      await processExecution(session);
    }
  } catch (error) {
    console.error(`Lỗi khi xử lý phiên ${session.id}:`, error);
    if (session.id) {
      await updateSessionStatus(session.id, "error", {
        progress_log: `Lỗi Worker: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }
}

async function processNewUrl(session: RemoteSession) {
  if (!session.request_url) throw new Error("URL yêu cầu không tồn tại.");

  console.log(
    `Đang xử lý URL mới cho phiên ${session.id}: ${session.request_url}`
  );
  await updateSessionStatus(session.id, "processing");

  const urlParts = session.request_url.split("/");
  const accessCode = urlParts[urlParts.length - 1];

  if (!accessCode)
    throw new Error("Không thể tìm thấy mã truy cập (access code) từ URL.");

  const response = await fetch(
    `https://audience.ahaslides.com/api/presentation/audience-data/${accessCode}`
  );
  if (!response.ok)
    throw new Error(
      `Lấy dữ liệu AhaSlides thất bại. Status: ${response.status}`
    );

  const data: AudienceData = await response.json();

  const relevantData: SessionData = {
    question: data.name || "AhaSlides Question",
    options: data.SlideOptions.map((opt) => ({
      id: opt.id,
      title: opt.title,
      votesCount: opt.votesCount,
    })),
    internalDetails: {
      presentationId: data.presentationId,
      slideId: data.id,
      accessCode: data.presentation.accessCode,
      slideTimestamp: data.slideTimestamp,
      type: data.type,
      config: {
        timeToAnswer: data.timeToAnswer,
        multipleChoice: data.multipleChoice,
        isCorrectGetPoint: data.isCorrectGetPoint,
        stopSubmission: data.stopSubmission,
        fastAnswerGetMorePoint: data.fastAnswerGetMorePoint,
        showVotingResultsOnAudience: data.showVotingResultsOnAudience,
        version: data.version,
      },
    },
  };

  console.log(
    `Lấy dữ liệu thành công cho phiên ${session.id}. Gửi lại cho controller...`
  );
  await updateSessionStatus(session.id, "data_returned", {
    session_data: relevantData,
  });
}

async function processExecution(session: RemoteSession) {
  if (!session.execution_command || !session.session_data)
    throw new Error("Lệnh thực thi hoặc dữ liệu phiên không hợp lệ.");

  console.log(
    `Bắt đầu thực thi lệnh cho phiên ${session.id}:`,
    session.execution_command
  );
  await updateSessionStatus(session.id, "executing");

  const { targetId, count } = session.execution_command;
  const details = session.session_data.internalDetails;
  let successfulVotes = 0;

  const apiUrl = "https://audience.ahaslides.com/api/answer/create";

  const templatePayload: Omit<VotePayload, "audience" | "vote"> = {
    presentation: details.presentationId,
    slide: details.slideId,
    accessCode: details.accessCode,
    slideTimestamp: details.slideTimestamp,
    type: details.type,
    config: {
      ...details.config,
      quizTimestamp: [],
      otherCorrectQuiz: [],
    },
  };

  for (let i = 0; i < count; i++) {
    const votePayload: VotePayload = {
      ...templatePayload,
      audience: generateRandomAudienceId(),
      vote: [targetId],
    };

    try {
      const fetchResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(votePayload),
      });
      if (fetchResponse.ok) successfulVotes++;

      const progressMessage = `Đã gửi ${
        i + 1
      }/${count} vote... Thành công: ${successfulVotes}`;
      if ((i + 1) % 10 === 0 || i === count - 1) {
        await updateSessionStatus(session.id, "executing", {
          progress_log: progressMessage,
        });
      }
    } catch (error) {
      console.warn("Lỗi mạng khi gửi vote, bỏ qua và tiếp tục...");
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  const finalMessage = `Hoàn thành! Gửi thành công ${successfulVotes}/${count} phiếu.`;
  console.log(finalMessage);
  await updateSessionStatus(session.id, "completed", {
    progress_log: finalMessage,
  });
}

async function updateSessionStatus(
  sessionId: string,
  status: string,
  data: Partial<RemoteSession> = {}
) {
  const { error } = await supabase
    .from("remote_sessions")
    .update({ status, ...data, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error(`Lỗi khi cập nhật trạng thái cho phiên ${sessionId}:`, error);
    throw error;
  }
}

function generateRandomAudienceId(): string {
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
