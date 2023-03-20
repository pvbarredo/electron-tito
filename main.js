const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const sqlite = require('sqlite-electron')
const {autoUpdater} = require("electron-updater")
let log = require("electron-log")


sqlite.setdbPath("./db/tito.sqlite3")

let tray = null
let mainWindow = null

function createWindow() {
    log.info("Creating mainwindow ")
    mainWindow = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))

    mainWindow.on("close", event => {
        event.sender.hide()
        event.preventDefault() //prevent quit process
    })

    mainWindow.once("ready-to-show", () => {
        log.info("Checking for update ")
        autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.handle('email:start-day', () => {
        createEmailWindow(true)
        return
    })

    ipcMain.handle('email:end-day', () => {
        createEmailWindow(false)
        return
    })

    ipcMain.handle('python:send-start-day', () => {
        console.log("send start day ")
        log.info("send start day ")
        let pyshell = new PythonShell('./python/main.py')
        pyshell.on('message', function (message) {
            console.log(message);
            log.info(message);
        })
        pyshell.end(function (err) {
            if (err) {
                log.error(err);
                throw err;
            }
            console.log('finished');
            log.info("finished");
        })
    })

    ipcMain.handle('python:send-end-day', () => {
        console.log("send end day ")
        log.info("send end day ");
        let pyshell = new PythonShell('./python/main.py')
        pyshell.on('message', function (message) {
            console.log(message);
            log.info(message);
        })
        pyshell.end(function (err) {
            if (err) {
                log.error(err);
                throw err;
            }
            log.info('finished');
            console.log('finished');
        })
    })

    ipcMain.handle('executeQuery', async (event, query) => {
        return await sqlite.executeQuery(query, "all", []).then(data => data).catch(error => {
            log.error(error);
        });
    })
}

function createEmailWindow(isStartDayEmail) {
    const emailWindow = new BrowserWindow({
        width: 300,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'email-preload.js')
        }
    })
    emailWindow.loadFile(path.join(__dirname, './renderer/email.html'))
    emailWindow.on("close", () => {
        emailWindow.destroy()
    })


    ipcMain.on('emailWindow:is-start-day', (event) => {
        event.returnValue = isStartDayEmail
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    tray = new Tray('./assets/icon/icon.ico')
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {
                if(!mainWindow.isVisible()){
                    mainWindow.show()
                }
            }
        },
        {
            label: 'Close App',
            click: () => {app.quit()}
        }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    tray.on("click", ()=>{
        if(!mainWindow.isVisible()){
            mainWindow.show()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.setLoginItemSettings({
    openAtLogin: true
})