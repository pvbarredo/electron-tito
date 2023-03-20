const {app, BrowserWindow, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const {autoUpdater} = require("electron-updater")
let log = require("electron-log")

const sqlite3 = require('sqlite3').verbose()
const { open } = require('sqlite')


let tray = null
let mainWindow = null


function createDBConnection(){
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
        const db = await createDBConnection()
        const row = await db.get(query)
        return row

    })
}

function createEmailWindow(isStartDayEmail) {
    const emailWindow = new BrowserWindow({
        parent: mainWindow,
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