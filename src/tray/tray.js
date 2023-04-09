const {Tray, Menu, app, nativeImage} = require("electron");
const packageJson = require("../../package.json");
const log = require("electron-log");
const path = require("path");

exports.createTray = (mainWindow) => {
    log.info('Creating Tray')
    let tray = null
    try {
        //for prod build, it cannot see the image on start up
        let icon = path.join(__dirname, '../../assets/icon/icon.png')
        const nativeImageFromPath = nativeImage.createFromPath(icon)
        if(nativeImageFromPath.isEmpty()){
            log.info("Cannot find image from " + icon)
            icon = path.join(__dirname, '../../../../assets/icon/icon.png')
            log.info("Trying now " + icon)
        }

        tray = new Tray(nativeImage.createFromPath(icon))

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
    } catch (error) {
        log.error(error)
    }
    log.info('Tray created')
    return tray
}