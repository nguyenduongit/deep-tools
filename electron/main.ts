// electron/main.ts

import { app, BrowserWindow, ipcMain, webContents } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: true,
      webviewTag: true,
    },
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  win.maximize();
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  ipcMain.handle("set-request-listener", async (_event, webviewContentsId) => {
    const wc = webContents.fromId(webviewContentsId);
    if (!wc) {
      console.error(
        "Không tìm thấy webContents cho webview ID:",
        webviewContentsId
      );
      return;
    }

    wc.session.webRequest.onBeforeRequest(null);

    // *** THAY ĐỔI QUAN TRỌNG NHẤT ***
    // Sử dụng wildcard (*) để bắt tất cả các URL trong đường dẫn /api/
    const filter = {
      urls: ["https://audience.ahaslides.com/api/*"],
    };

    wc.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      // Chúng ta chỉ quan tâm đến các yêu cầu POST có dữ liệu gửi đi
      if (details.method === "POST" && details.uploadData) {
        console.log(`[MAIN PROCESS] Bắt được gói tin POST: ${details.url}`);
        try {
          const body = details.uploadData[0].bytes;
          const jsonString = Buffer.from(body).toString("utf8");
          const jsonData = JSON.parse(jsonString);

          // Gửi dữ liệu đã bắt được về cho giao diện React
          win?.webContents.send("json-captured", jsonData);
        } catch (error) {
          console.error("[MAIN PROCESS] Lỗi phân tích body:", error);
        }
      }
      callback({}); // Cho phép yêu cầu tiếp tục
    });

    console.log(
      `[MAIN PROCESS] Đã thiết lập listener cho TẤT CẢ các URL API của Ahaslides.`
    );
  });

  createWindow();
});
