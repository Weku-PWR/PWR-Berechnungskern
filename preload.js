const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('pwrDesktop', { platform: process.platform, desktop: true });
