async function bodyOnload (){``
    document.getElementById("isStartDay").textContent = await window.emailWindow.isStartDayEmail()
}

