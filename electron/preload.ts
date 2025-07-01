import {
  ipcRenderer,
  contextBridge,
  IpcRendererEvent,
  clipboard,
} from "electron";

contextBridge.exposeInMainWorld("ipcRenderer", {
  on(
    channel: string,
    // Thay thế 'any[]' bằng 'unknown[]'
    listener: (event: IpcRendererEvent, ...args: unknown[]) => void
  ): () => void {
    ipcRenderer.on(channel, listener);
    return () => {
      ipcRenderer.removeListener(channel, listener);
    };
  },

  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },

  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },

  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  clipboard: {
    readText: () => clipboard.readText(),
  },
});
