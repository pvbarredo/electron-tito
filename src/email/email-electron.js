const { BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const {PythonShell} = require('python-shell')

let log = require("electron-log")
const {createDBConnection} = require("../common/util");

exports.createEmailWindow = (mainWindow, emailWindow, isStartDayEmail) => {
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
            preload: path.join(__dirname, './email-preload.js')
        }
    })
    emailWindow.loadFile(path.join(__dirname, './email.html'))

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