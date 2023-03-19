const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('python', {
    startDay: () => ipcRenderer.invoke('python:send-start-day'),
    endDay: () => ipcRenderer.invoke('python:send-end-day')
})

contextBridge.exposeInMainWorld('email', {
    startDay: () => ipcRenderer.invoke('email:start-day'),
    endDay: () => ipcRenderer.invoke('email:end-day'),
    close: () => ipcRenderer.invoke('email:close')
})

contextBridge.exposeInMainWorld('sqlite', {
    executeQuery: (query) => {
        console.log(query + " from expose")
        return ipcRenderer.invoke('executeQuery', query)
    }
})