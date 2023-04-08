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
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, './main/main-preload.js')
        }
    })
    mainWindow.loadFile(path.join(__dirname, './main/main.html'))


    mainWindow.on("close", event => {
        if (!app.isQuiting) {
            event.sender.hide()
            event.preventDefault() //prevent quit process
        }
    })


    setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify()
    }, 60 * 1000 * 15) //15 mins check for update

    mainWindow.once("ready-to-show", () => {
        log.info("Checking for update ")
        autoUpdater.checkForUpdatesAndNotify()
    })

    autoUpdater.on('update-available', (updateInfo) => {
        //Callback function
        console.log(updateInfo.releaseName, updateInfo.releaseNotes, updateInfo.releaseDate)
        mainWindow.webContents.send('updateAvailable', updateInfo)
    });

    ipcMain.handle('email:start-day', () => {
        createEmailWindow(true)

    })

    ipcMain.handle('email:end-day', () => {
        createEmailWindow(false)
    })

    ipcMain.handle('email:check-start-day', (event, args) => {
        const isForBackgroundProcess = !!args
        let payload = {
            isStartDayEmail: true,
            emailSubject: "WFH " + new Date().toDateString()
        }
        let pyshell = new PythonShell('./python/check.py')
        log.info("Running python check.py")

        pyshell.send(JSON.stringify(payload))
        pyshell.on("message", function (message) {

            isForBackgroundProcess ? mainWindow.webContents.send('checkStartDayEmailInBackground', message)
                : mainWindow.webContents.send('checkStartDayEmail', message)

        })
        pyshell.end(async function (err) {
            if (err) {
                console.log(err)
                log.error(err)

                throw err
            }
            log.info('finished')
            console.log('finished')
        })
    })

    ipcMain.handle('email:check-end-day', (event, args) => {
        const isForBackgroundProcess = !!args
        let payload = {
            isStartDayEmail: false,
            emailSubject: "RE: WFH " + new Date().toDateString()
        }
        let pyshell = new PythonShell('./python/check.py')
        log.info("Running python check.py")

        pyshell.send(JSON.stringify(payload), {mode: 'json'})
        pyshell.on("message", function (message) {
            log.info("Python return message")
            isForBackgroundProcess ? mainWindow.webContents.send('checkEndDayEmailInBackground', message) :
                mainWindow.webContents.send('checkEndDayEmail', message)
        })
        pyshell.end(async function (err) {
            if (err) {
                console.log(err)
                log.error(err)

                throw err
            }
            log.info('finished')
            console.log('finished')
        })
    })

    ipcMain.handle('email:checkbox-start', async (event, payload) => {
       console.log(payload, " IPC MAIN")
    })
    ipcMain.handle('email:checkbox-end', async (event, payload) => {
        console.log(payload, " IPC MAIN")
    })

    ipcMain.handle('executeQuery', async (event, query) => {
        const db = await createDBConnection()
        const row = await db.get(query)
        await db.close()
        return row

    })
}

function createEmailWindow(isStartDayEmail) {
    if (emailWindow) {
        if (!emailWindow.isDestroyed()) {
            emailWindow.show()
            return
        }
    }
    emailWindow = new BrowserWindow({
        parent: mainWindow,
        width: 500,
        height: 650,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, './email/email-preload.js')
        }
    })
    emailWindow.loadFile(path.join(__dirname, './email/email.html'))

    emailWindow.webContents.on("did-finish-load", async () => {
        emailWindow.webContents.send('isStartDayEmail', isStartDayEmail)
        const query = isStartDayEmail ? "SELECT * FROM EMAIL WHERE NAME = 'start_day'" : "SELECT * FROM EMAIL WHERE NAME = 'end_day'"
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
        pyshell.end(async function (err) {
            if (err) {
                log.error(err)
                throw err
            }
            log.info('finished')
            console.log('finished')

            //after sending email  save
            let query = "UPDATE email SET  body_email = ?, to_email = ?  WHERE NAME='start_day' OR NAME='end_day'"
            if (!isStartDayEmail) {
                query = "UPDATE email SET body_email = ?, to_email = ?  WHERE NAME='end_day'"
            }
            const db = await createDBConnection()
            await db.run(query, args.emailBody, args.emailTo)
            await db.close()

            emailWindow.close()
        })
    })
}

app.whenReady().then(() => {
    log.info("App is Ready")
    createMainWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            log.info("App activate but 0 windows")
            createMainWindow()
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
