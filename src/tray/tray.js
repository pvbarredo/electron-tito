const {Tray, Menu, app} = require("electron");
const packageJson = require("../../package.json");
const log = require("electron-log");

exports.createTray = (mainWindow) => {
    log.info('Creating Tray')
    let tray = new Tray('./assets/icon/icon.png')
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

    log.info('Tray created')
    return tray
}