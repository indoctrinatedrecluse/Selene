/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");

let mainWindow = null;
const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

function checkServerReady(url, maxAttempts = 30, interval = 1000) {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve(true);
          } else if (attempts < maxAttempts) {
            setTimeout(check, interval);
          } else {
            resolve(false);
          }
        })
        .on("error", () => {
          if (attempts < maxAttempts) {
            setTimeout(check, interval);
          } else {
            resolve(false);
          }
        });
    };
    check();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#070A14",
    title: "Selene — Technical Documentation & Live Code Canvas",
    icon: path.join(__dirname, "../src/app/icon.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  buildMenu();

  const splashPath = path.join(__dirname, "splash.html");
  if (fs.existsSync(splashPath)) {
    mainWindow.loadFile(splashPath);
  }

  checkServerReady(DEV_URL).then((ready) => {
    if (ready && mainWindow) {
      mainWindow.loadURL(DEV_URL);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Document",
          accelerator: "CmdOrCtrl+N",
          click: () => mainWindow?.webContents.send("selene:menu-command", "new-document"),
        },
        {
          label: "Open Local File...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const res = await handleOpenFile();
            if (res && mainWindow) {
              mainWindow.webContents.send("selene:menu-command", "file-opened", res);
            }
          },
        },
        {
          label: "Save Document",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow?.webContents.send("selene:menu-command", "save-document"),
        },
        { type: "separator" },
        {
          label: "Presentation Slide Deck",
          accelerator: "F5",
          click: () => mainWindow?.webContents.send("selene:menu-command", "toggle-slides"),
        },
        {
          label: "Publish & Export...",
          accelerator: "CmdOrCtrl+E",
          click: () => mainWindow?.webContents.send("selene:menu-command", "open-publish-modal"),
        },
        { type: "separator" },
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => app.quit(),
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Titan Lore & Heritage",
          click: () => mainWindow?.webContents.send("selene:menu-command", "open-lore"),
        },
        {
          label: "Manage License & Device...",
          click: () => mainWindow?.webContents.send("selene:menu-command", "open-license"),
        },
        {
          label: "GitHub Repository",
          click: () => shell.openExternal("https://github.com/indoctrinatedrecluse/Selene"),
        },
        { type: "separator" },
        {
          label: "About Selene Desktop",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Selene",
              message: "🌙 Selene — Live Code Document Canvas",
              detail: `Titan Edition v${app.getVersion() || "0.2.0"}\nProprietary License © 2026 Abhishek Mitra\nDesktop Shell: Electron ${process.versions.electron}\nRuntime: Node.js ${process.versions.node}\nChromium: ${process.versions.chrome}`,
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function handleOpenFile() {
  if (!mainWindow) return null;
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Open Markdown or Selene Document",
    filters: [
      { name: "Markdown / Selene Documents", extensions: ["md", "markdown", "selene", "txt"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });

  if (canceled || filePaths.length === 0) return null;

  const targetPath = filePaths[0];
  try {
    const content = fs.readFileSync(targetPath, "utf-8");
    const name = path.basename(targetPath);
    return { path: targetPath, name, content };
  } catch (err) {
    dialog.showErrorBox("Error Reading File", `Could not read file: ${err.message}`);
    return null;
  }
}

async function handleSaveFile(content, defaultName = "document.md") {
  if (!mainWindow) return null;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Save Document to Disk",
    defaultPath: defaultName,
    filters: [
      { name: "Markdown Document (*.md)", extensions: ["md"] },
      { name: "Selene Document (*.selene)", extensions: ["selene"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || !filePath) return null;

  try {
    fs.writeFileSync(filePath, content, "utf-8");
    return { success: true, path: filePath, name: path.basename(filePath) };
  } catch (err) {
    dialog.showErrorBox("Error Saving File", `Could not save file: ${err.message}`);
    return { success: false, error: err.message };
  }
}

// IPC Handlers
ipcMain.handle("selene:open-dialog", async () => {
  return await handleOpenFile();
});

ipcMain.handle("selene:save-dialog", async (_event, content, defaultName) => {
  return await handleSaveFile(content, defaultName);
});

ipcMain.handle("selene:get-system-info", () => {
  return {
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    isDesktop: true,
  };
});

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
