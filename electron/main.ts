// electron/main.ts

import { app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeRemoteWorker } from "./remote/worker";

// ---- CÁC HẰNG SỐ KHỞI TẠO ----
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

/**
 * Hàm tạo cửa sổ chính cho ứng dụng.
 */
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      // Preload script để expose các API của Electron một cách an toàn
      preload: path.join(__dirname, "preload.mjs"),
      // Các tùy chọn này cần thiết để webview hoạt động
      nodeIntegration: true,
      contextIsolation: true,
      webviewTag: true,
    },
  });

  // Gửi một message mẫu về cho renderer khi web acontents đã tải xong
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Tải giao diện người dùng (React app)
  // Nếu đang trong môi trường dev, tải từ dev server. Nếu không, tải từ file build.
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }

  // Mở developer tools nếu đang trong môi trường dev
  // if (process.env.NODE_ENV === "development") {
  //   win.webContents.openDevTools();
  // }

  // Phóng to cửa sổ khi khởi động
  win.maximize();
}

// ---- QUẢN LÝ VÒNG ĐỜI ỨNG DỤNG ----

// Thoát ứng dụng khi tất cả cửa sổ đã bị đóng (trừ trên macOS).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

// Tạo lại cửa sổ khi icon ứng dụng được click trên dock (chỉ dành cho macOS).
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Khởi tạo ứng dụng khi đã sẵn sàng.
app.whenReady().then(() => {
  createWindow();
  initializeRemoteWorker();
});
