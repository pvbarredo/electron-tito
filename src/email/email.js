document.getElementById('sendMail').addEventListener('click', async () => {
    await window.email.sendMail()
})

