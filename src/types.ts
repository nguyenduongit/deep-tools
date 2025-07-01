// src/types.ts

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
  // Cho phép 'vote' có thể là mảng số hoặc một chuỗi
  vote: number[] | string;
  timestamp?: number;
}

export type AnswerPayload = VotePayload;
