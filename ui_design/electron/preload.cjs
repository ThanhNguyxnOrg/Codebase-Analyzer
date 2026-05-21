const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("codebaseAnalyzer", {
  pickDirectory: () => ipcRenderer.invoke("cba:pick-directory"),
});
