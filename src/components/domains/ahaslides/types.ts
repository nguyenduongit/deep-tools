// src/components/domains/ahaslides/types.ts

/**
 * Cấu trúc payload để GỬI ĐI một lượt vote.
 */
export interface VotePayload {
  presentation: number;
  slide: number;
  audience: string;
  accessCode?: string;
  slideTimestamp: string;
  config: {
    timeToAnswer: number;
    quizTimestamp: unknown[];
    multipleChoice: boolean;
    isCorrectGetPoint: boolean;
    stopSubmission: boolean;
    fastAnswerGetMorePoint: boolean;
    otherCorrectQuiz: unknown[];
    showVotingResultsOnAudience: boolean;
    version: number;
  };
  type: string;
  vote: number[]; // Mảng chứa ID của lựa chọn được vote
}

/**
 * Cấu trúc payload để GỬI ĐI một reaction (biểu cảm).
 */
export interface ReactionPayload {
  audienceId: string;
  audienceName: string;
  slideId: number;
  presentationId: number;
  reactionType: "like" | "heart" | "laugh" | "sad" | "wow";
}

/**
 * Cấu trúc của một lựa chọn (ví dụ: một đội, một phương án) trong slide.
 */
export interface SlideOption {
  id: number;
  title: string;
  imageCropped: string | null;
  votesCount: number;
}

/**
 * Cấu trúc đầy đủ của dữ liệu slide được lấy về từ API `audience-data`.
 */
export interface AudienceData {
  id: number; // Đây chính là slideId
  presentationId: number;
  type: string;
  multipleChoice: boolean;
  isCorrectGetPoint: boolean;
  stopSubmission: boolean;
  fastAnswerGetMorePoint: boolean;
  showVotingResultsOnAudience: boolean;
  version: number;
  timeToAnswer: number;
  slideTimestamp: string;
  SlideOptions: SlideOption[];
  presentation: {
    accessCode: string;
    // Liệt kê các reactions được cho phép để có thể dùng trong component
    reactions: {
      sad: boolean;
      wow: boolean;
      like: boolean;
      heart: boolean;
      laugh: boolean;
    };
  };
}
