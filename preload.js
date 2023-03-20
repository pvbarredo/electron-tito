const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('python', {
    startDay: () => ipcRenderer.invoke('python:send-start-day'),
    endDay: () => ipcRenderer.invoke('python:send-end-day')
})

contextBridge.exposeInMainWorld('email', {
    startDay: () => ipcRenderer.invoke('email:start-day'),
    endDay: () => ipcRenderer.invoke('email:end-day'),
    checkStartDay: () => ipcRenderer.invoke('email:check-start-day'),
    checkEndDay: () => ipcRenderer.invoke('email:check-end-day'),

    close: () => ipcRenderer.invoke('email:close')
})


ipcRenderer.on('checkStartDayEmail', (event, args) => {
    console.log(args)
    alert(args === 'True' ? "You already sent a start day email" : "You have not yet submitted a start day email")
})

ipcRenderer.on('checkEndDayEmail', (event, args) => {
    console.log(args)
    alert(args === 'True' ? "You already sent an end day email" : "You have not yet submitted an end day email")
})