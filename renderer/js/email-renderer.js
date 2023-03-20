async function bodyOnPageShow (){``
    document.getElementById("isStartDay").textContent = await window.emailWindow.isStartDayEmail()
}

