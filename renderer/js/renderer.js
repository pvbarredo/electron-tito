document.getElementById('send-start-day').addEventListener('click', async () => {
    await window.email.startDay()
})

document.getElementById('send-end-day').addEventListener('click', async () => {
    await window.email.endDay()
})

document.getElementById('fetch').addEventListener('click', async () => {
    let result = await window.sqlite.executeQuery("SELECT * FROM user")
    console.log(result)
})

function showTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var session = "AM";
    if (h == 0) {
        h = 12;
    }
    if (h > 12) {
        hh = h - 12;
        session = "PM";
    }
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    var time = h + ":" + m + ":" + s + " " + session;
    document.getElementById("date").textContent = date.toDateString()
    document.getElementById("time").textContent = time
    setTimeout(showTime, 1000);

}
showTime()


const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked!'

// new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick = () => document.getElementById("output").innerText = CLICK_MESSAGE