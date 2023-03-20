import json
import sys

import win32com.client


def _find_message_using_subject(messages, subject):
    for i in range(0, len(messages)):
        # print(messages[i].Subject, subject)
        if messages[i].Subject == subject:
            # print(messages[i])
            return messages[i]


def reply_email(mail_subject, mail_body):
    outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    sent_item = outlook.GetDefaultFolder(5)
    messages = sent_item.Items
    subject = mail_subject
    message = _find_message_using_subject(messages, subject)
    if message is None:
        print("No message in sent item folder has the subject " + subject)
        return

    reply_mail = message.ReplyAll()
    reply_mail.Body = "Accomplished\n " + mail_body + reply_mail.Body
    reply_mail.Send()


def send_email(mail_to, mail_subject, mail_body):
    outlook = win32com.client.Dispatch("Outlook.Application")
    mail = outlook.CreateItem(0)
    mail.To = mail_to
    mail.Subject = mail_subject
    mail.Body = "Plan to Do\n " + mail_body
    mail.Send()


emailTo = ''
emailBody = ''
emailSubject = ''
isStartDayEmail = False

for line in sys.stdin:
    isStartDayEmail = json.loads(line)["isStartDayEmail"]
    emailTo = json.loads(line)["emailTo"]
    emailBody = json.loads(line)["emailBody"]
    emailSubject = json.loads(line)["emailSubject"]

if isStartDayEmail:
    send_email(emailTo, emailSubject, emailBody)
else:
    reply_email(emailSubject, emailBody)
