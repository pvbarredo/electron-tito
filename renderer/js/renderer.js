import packageJSON from "../../package.json" assert {type: 'json'}
document.title = "TITO " + packageJSON.version

document.getElementById('send-start-day').addEventListener('click', async () => {
    await window.email.startDay()
})

document.getElementById('send-end-day').addEventListener('click', async () => {
    await window.email.endDay()
})
document.getElementById('check-start-day').addEventListener('click', async () => {
    await window.email.checkStartDay()
})

document.getElementById('check-end-day').addEventListener('click', async () => {
    await window.email.checkEndDay()
})

function showTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var hh = ''
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