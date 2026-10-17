/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("seleneDesktop", {
  isDesktop: true,
  runtime: "electron",
  platform: process.platform,

  openFileDialog: () => ipcRenderer.invoke("selene:open-dialog"),

  saveFileDialog: (content, defaultName) =>
    ipcRenderer.invoke("selene:save-dialog", content, defaultName),

  getSystemInfo: () => ipcRenderer.invoke("selene:get-system-info"),

  onMenuCommand: (callback) => {
    const handler = (_event, command, payload) => callback(command, payload);
    ipcRenderer.on("selene:menu-command", handler);
    return () => ipcRenderer.removeListener("selene:menu-command", handler);
  },
});
