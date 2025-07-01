export interface AnswerPayload {
  data: {
    type: string;
    attributes: {
      answer: string;
      question_id: number;
      // Thêm các thuộc tính khác nếu có
    };
  };
}
