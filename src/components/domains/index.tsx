import AhaSlides from "./AhaSlides";
import React from "react";
import { AnswerPayload } from "../../types"; // Import kiểu mới

// Cập nhật kiểu props
export const domainComponents: {
  [key: string]: React.ComponentType<{
    url: string;
    capturedJson: (AnswerPayload & { timestamp: number }) | null;
  }>;
} = {
  "audience.ahaslides.com": AhaSlides,
  "present.ahaslides.com": AhaSlides,
};
