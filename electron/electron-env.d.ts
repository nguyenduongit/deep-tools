/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    APP_ROOT: string;
    VITE_PUBLIC: string;
  }
}

interface Window {
  ipcRenderer: import("electron").IpcRenderer & {
    clipboard: {
      readText: () => Promise<string>;
    };
  };
}

// Thêm thuộc tính 'partition' vào đây
declare namespace JSX {
  interface IntrinsicElements {
    webview: React.DetailedHTMLProps<
      React.HTMLAttributes<Electron.WebviewTag> & {
        src: string;
        partition?: string; // Thêm dòng này
      },
      Electron.WebviewTag
    >;
  }
}
