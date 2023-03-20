const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const {autoUpdater} = require("electron-updater")
let log = require("electron-log")

const sqlite3 = require('sqlite3').verbose()
const {open} = require('sqlite')


let tray = null
let mainWindow = null
let emailWindow = null

function createDBConnection() {
    return open({
        filename: "./db/tito.sqlite3",
        driver: sqlite3.Database
    })
}

function createMainWindow() {
    log.info("Creating mainwindow ")
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))


    // mainWindow.on("close", event => {
    //     event.sender.hide()
    //     event.preventDefault() //prevent quit process
    // })


    mainWindow.once("ready-to-show", () => {
        log.info("Checking for update ")
        autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.handle('email:start-day', () => {
        createEmailWindow(true)

    })

    ipcMain.handle('email:end-day', () => {
        createEmailWindow(false)
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
        const db = await createDBConnection()
        const row = await db.get(query)
        await db.close()
        return row

    })
}

function createEmailWindow(isStartDayEmail) {
    if(emailWindow) {
        if (!emailWindow.isDestroyed()) {
            console.log("SHOW MAY EMAIL WINDOW AT DI DESTROYED")
            emailWindow.show()
            return
        }
    }
    emailWindow = new BrowserWindow({
        parent: mainWindow,
        width: 500,
        height: 650,
        webPreferences: {
            preload: path.join(__dirname, 'email-preload.js')
        }
    })
    emailWindow.loadFile(path.join(__dirname, './renderer/email.html'))

    emailWindow.webContents.on("did-finish-load", async() => {
        emailWindow.webContents.send('isStartDayEmail', isStartDayEmail)
        const query = isStartDayEmail ? "SELECT * FROM EMAIL WHERE NAME = 'start_day'" :  "SELECT * FROM EMAIL WHERE NAME = 'end_day'"
        const db = await createDBConnection()
        const row = await db.get(query)
        await db.close()

        emailWindow.webContents.send('email_data', row)
    })
    ipcMain.removeHandler('email:send-mail') //because we are using same window - it cannot register another handle
    ipcMain.handle('email:send-mail', (event, args) => {
        args['isStartDayEmail'] = isStartDayEmail
        let pyshell = new PythonShell('./python/main.py')

        pyshell.send(JSON.stringify(args))

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
}

app.whenReady().then(() => {
    createMainWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })

    tray = new Tray('./assets/icon/icon.ico')
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
                app.quit()
            }
        }
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
        if (!mainWindow.isVisible()) {
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