const {app, BrowserWindow, ipcMain, nativeTheme} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')
const sqlite = require('sqlite-electron')

sqlite.setdbPath("./db/tito.sqlite3")

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile(path.join(__dirname, './renderer/index.html'))

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
        let pyshell = new PythonShell('./python/main.py')
        pyshell.on('message', function (message) {
            console.log(message);
        })
        pyshell.end(function (err) {
            if (err) {
                throw err;
            }
            console.log('finished');
        })
    })

    ipcMain.handle('python:send-end-day', () => {
        console.log("send end day ")
        let pyshell = new PythonShell('./python/main.py')
        pyshell.on('message', function (message) {
            console.log(message);
        })
        pyshell.end(function (err) {
            if (err) {
                throw err;
            }

            console.log('finished');
        })
    })

    ipcMain.handle('executeQuery', async (event, query) => {
        return await sqlite.executeQuery(query, "all", []);
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
        console.log("TINAWAG" , isStartDayEmail)
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
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})