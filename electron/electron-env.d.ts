/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

// Dùng trong tiến trình Renderer, được expose trong `preload.ts`
interface Window {
  ipcRenderer: import("electron").IpcRenderer & {
    clipboard: {
      readText: () => Promise<string>;
    };
  };
}

// Khai báo kiểu cho thẻ webview để React/JSX nhận diện
declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<Electron.WebviewTag> & {
        src: string;
        // Thêm các thuộc tính khác của webview nếu cần
      },
      Electron.WebviewTag
    >;
  }
}
