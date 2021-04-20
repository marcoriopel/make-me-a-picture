const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

let mainWindow

const iconPathPlatform = process.platform !== 'darwin'
  ? 'src/assets/icons/LogoLight.ico'
  : 'src/assets/icons/LogoLight.icns';

const iconPath = app.isPackaged
  ? path.join(process.resourcesPath, iconPathPlatform)
  : path.join(__dirname, iconPathPlatform);

  
function createWindow () {
  mainWindow = new BrowserWindow({
    // icon: iconPath,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }
    
  })

  mainWindow.webContents.on('did-fail-load', () => {
    console.log('did-fail-load');
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  });

  mainWindow.removeMenu();
  mainWindow.maximize();
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
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
