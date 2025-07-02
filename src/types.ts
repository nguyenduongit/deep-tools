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
  vote: number[] | string;
  timestamp?: number;
}

export type AnswerPayload = VotePayload;

export interface CapturedPacket {
  id: number;
  timestamp: string;
  data: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: unknown;
  };
}
