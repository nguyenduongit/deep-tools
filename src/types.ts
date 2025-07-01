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
  vote: number[];
  timestamp?: number;
}

export type AnswerPayload = VotePayload;
