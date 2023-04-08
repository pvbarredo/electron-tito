const {app, BrowserWindow} = require('electron')
let log = require("electron-log")
const packageJson = require('../package.json')
const isDev = require('electron-is-dev')
const AutoLaunch = require("auto-launch");

if (process.platform === 'win32') {
    app.setAppUserModelId("Tito " + packageJson.version)
}

const {createMainWindow} = require('./main/main-electron')
const {createTray} = require("./tray/tray");

let mainWindow = null

app.whenReady().then(async() => {
    log.info("App is Ready")
   mainWindow = await createMainWindow(mainWindow)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            log.info("App activate but 0 windows")
            createMainWindow(mainWindow)
        }
    })

    createTray(mainWindow)
})

let isSingleInstance = app.requestSingleInstanceLock()
if (!isSingleInstance) {
    // prevent multiple process
    log.info("App multiple instance prevented")
    app.quit()
}

app.on('before-quit', function () {
    log.info("App is quitting")
    app.isQuiting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

if (!isDev) {
    const autoStart = new AutoLaunch({
        name: "Tito " + packageJson.version,
    });
    autoStart.enable();
}
