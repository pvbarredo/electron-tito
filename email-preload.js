const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('emailWindow', {
    isStartDayEmail: () => {
        console.log("email window preload called")
        return ipcRenderer.send('emailWindow:is-start-day' )
    }
})

ipcRenderer.on('isStartDayEmail', (event, args) => {
    document.title = args ? "Email Start Day" : "Email End Day"
})

ipcRenderer.on('email_data', (event, args) => {
    console.log(args)
    document.getElementById("emailTo").value = args.to_email;
    document.getElementById("emailBody").textContent = args.body_email;
})