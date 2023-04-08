let log = require("electron-log")
const {autoUpdater} = require("electron-updater")
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const {createEmailWindow} = require("../email/email-electron");

exports.createMainWindow = (mainWindow) => {
    let emailWindow = null;
    log.info("Creating mainwindow ")
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        autoHideMenuBar: true,
        icon: path.join(__dirname, './assets/icon/icon.png'),
        webPreferences: {
            preload: path.join(__dirname, './main-preload.js')
        }
    })
    mainWindow.loadFile(path.join(__dirname, './main.html'))


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
        createEmailWindow(mainWindow, emailWindow, true)

    })

    ipcMain.handle('email:end-day', () => {
        createEmailWindow(mainWindow, emailWindow, false)
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