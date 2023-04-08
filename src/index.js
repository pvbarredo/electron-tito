const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const {autoUpdater} = require("electron-updater")
let log = require("electron-log")
const packageJson = require('../package.json')
const isDev = require('electron-is-dev')

const sqlite3 = require('sqlite3').verbose()
const {open} = require('sqlite')

if (process.platform === 'win32') {
    app.setAppUserModelId("Tito " + packageJson.version)
}

const {createMainWindow} = require('./main/main-electron')

let tray = null
let mainWindow = null

app.whenReady().then(() => {
    log.info("App is Ready")
    createMainWindow(mainWindow)

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            log.info("App activate but 0 windows")
            createMainWindow(mainWindow)
        }
    })

    tray = new Tray('./assets/icon/icon.png')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if (!mainWindow.isVisible()) {
                    mainWindow.show()
                }
            }
        },
        {
            label: 'Close App',
            click: () => {
                app.isQuiting = true
                app.quit()
            }
        }
    ])
    tray.setToolTip('Tito ' + packageJson.version)
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
        if (!mainWindow.isVisible()) {
            mainWindow.show()
        }
    })
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
    app.setLoginItemSettings({
        openAtLogin: true,
        args: ['--hidden']
    })
}
