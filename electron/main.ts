// electron/main.ts

import { app, BrowserWindow, ipcMain, webContents } from "electron"; // Thêm ipcMain và webContents
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
  // Lắng nghe yêu cầu từ renderer để thiết lập bộ lọc mạng
  ipcMain.handle("set-request-listener", async (_event, webviewContentsId) => {
    const wc = webContents.fromId(webviewContentsId);
    if (!wc) {
      console.error(
        "Không tìm thấy webContents cho webview ID:",
        webviewContentsId
      );
      return;
    }

    // Xóa listener cũ trước khi thêm mới để tránh trùng lặp
    wc.session.webRequest.onBeforeRequest(null);

    const filter = {
      urls: ["https://audience.ahaslides.com/api/answer/create"],
    };

    wc.session.webRequest.onBeforeRequest(filter, (details, callback) => {
      console.log(
        `[MAIN PROCESS] Bắt gói tin: ${details.method} ${details.url}`
      );
      if (details.method === "POST" && details.uploadData) {
        try {
          const body = details.uploadData[0].bytes;
          const jsonString = Buffer.from(body).toString("utf8");
          const jsonData = JSON.parse(jsonString);

          // Gửi dữ liệu đã bắt được về cho renderer process của cửa sổ chính
          win?.webContents.send("json-captured", jsonData);
        } catch (error) {
          console.error("[MAIN PROCESS] Lỗi phân tích body:", error);
        }
      }
      callback({});
    });

    console.log(
      `[MAIN PROCESS] Đã thiết lập listener cho webview ID: ${webviewContentsId}`
    );
  });

  createWindow();
});
