// src/types.ts

/**
 * Cấu trúc chung cho một gói tin mạng được bắt lại bởi các công cụ trong panel.
 * Đây là một kiểu dùng chung, không phụ thuộc vào domain cụ thể.
 */
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
