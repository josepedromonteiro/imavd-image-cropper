const {app, BrowserWindow, ipcMain} = require('electron')
const url = require("url");
const path = require("path");

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1020,
    height: 900,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      nodeIntegration: true,
      backgroundThrottling: false
    }
  })

  mainWindow.on('enter-full-screen', ()=>{
    mainWindow.webContents.send('isFullscreen', true);
  })

  mainWindow.on('leave-full-screen', ()=>{
    mainWindow.webContents.send('isFullscreen', false);
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/www/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})
