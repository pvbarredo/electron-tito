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
    checkStartDayInBackground: () => ipcRenderer.invoke('email:check-start-day', {background: true}),
    checkEndDayInBackground: () => ipcRenderer.invoke('email:check-end-day', {background: true}),
    close: () => ipcRenderer.invoke('email:close')
})


ipcRenderer.on('checkStartDayEmail', (event, args) => {
    alert(args === 'True' ? "You have already submitted a start day email": "You have NOT yet submitted a start day email")
})

ipcRenderer.on('checkEndDayEmail', (event, args) => {
    alert(args === 'True' ? "You have already submitted an End day email": "You have NOT yet submitted an End day email")
})

ipcRenderer.on('checkStartDayEmailInBackground', (event, args) => {
    if(args !== 'True'){
        new Notification("START DAY EMAIL", { body: "You have NOOOTTT yet submitted a start day email" })
    }
})

ipcRenderer.on('checkEndDayEmailInBackground', (event, args) => {
    if(args !== 'True'){
        new Notification("END DAY EMAIL", { body: "You have NOOOTTT yet submitted an end day email"})
    }
})