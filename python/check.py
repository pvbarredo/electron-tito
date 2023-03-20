import json
import sys

import win32com.client


def _find_message_using_subject(messages, subject):
    for i in range(0, len(messages)):
        if messages[i].Subject == subject:
            return messages[i]


def already_have_start_day_email(emailSubject):
    outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    sent_item = outlook.GetDefaultFolder(5)
    messages = sent_item.Items
    subject = emailSubject
    message = _find_message_using_subject(messages, subject)
    if message is None:
        print(False)
        return False
    print(True)
    return True


def already_have_end_day_email(emailSubject):
    outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    sent_item = outlook.GetDefaultFolder(5)
    messages = sent_item.Items
    subject = emailSubject
    message = _find_message_using_subject(messages, subject)
    if message is None:
        print(False)
        return False
    print(True)
    return True



isStartDayEmail = False
emailSubject = ''
for line in sys.stdin:
    isStartDayEmail = json.loads(line)["isStartDayEmail"]
    emailSubject = json.loads(line)["emailSubject"]

if isStartDayEmail:
    already_have_start_day_email(emailSubject)
else:
    already_have_end_day_email(emailSubject)


