const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('email', {
    sendMail: () => {
        const emailTo = document.getElementById("emailTo").value
        const emailSubject = document.getElementById("emailSubject").value
        const emailBody = document.getElementById("emailBody").textContent
        console.log(emailTo, emailSubject, emailBody)

        ipcRenderer.invoke('email:send-mail', {emailTo, emailSubject, emailBody})
    },
})

ipcRenderer.on('isStartDayEmail', (event, args) => {
    document.title = args ? "Email Start Day" : "Email End Day"
})

ipcRenderer.on('email_data', (event, args) => {

    document.getElementById("emailTo").value = args.to_email;
    document.getElementById("emailSubject").value = "WFH " + new Date().toDateString();
    document.getElementById("emailBody").textContent = args.body_email;
})