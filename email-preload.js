const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('emailWindow', {
    isStartDayEmail: () => {
        console.log("email window preload called")
        return ipcRenderer.sendSync('emailWindow:is-start-day', '')

    }
})