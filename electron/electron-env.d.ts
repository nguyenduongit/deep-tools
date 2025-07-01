/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

// Định nghĩa một kiểu tùy chỉnh cho API ipcRenderer được expose
interface ExposedIpcRenderer {
  on: (
    channel: string,
    // Thay thế 'any[]' bằng 'unknown[]' để an toàn hơn
    listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void
  ) => () => void;
  off: (...args: Parameters<Electron.IpcRenderer["off"]>) => void;
  send: (...args: Parameters<Electron.IpcRenderer["send"]>) => void;
  // Thay thế 'Promise<any>' bằng 'Promise<unknown>'
  invoke: (
    ...args: Parameters<Electron.IpcRenderer["invoke"]>
  ) => Promise<unknown>;
  clipboard: {
    readText: () => Promise<string>;
  };
}

interface Window {
  ipcRenderer: ExposedIpcRenderer;
}

// Thêm thuộc tính 'partition' vào đây
declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<Electron.WebviewTag> & {
        src: string;
        partition?: string;
      },
      Electron.WebviewTag
    >;
  }
}
