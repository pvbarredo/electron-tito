import win32com.client


def _find_folder(outlook_folders, folder_search_name):
    i = 0
    for folders in outlook_folders:
        for folder in folders.Folders:
            # print(folders.Name + " " + folder.Name + " " + str(i))
            i = i + 1



def _find_subfolder(Folders_obj, folder_search_name):
    # print([folder_name.Name for folder_name in Folders_obj])
    """ Recurse through all Outlook folders to find user-defined folder names"""
    for i in range(0, len(Folders_obj)):
        try:
            ret = Folders_obj[i].Folders[folder_search_name]
            print(Folders_obj[i].Name + " " + ret)
            return ret
        except:
            ret = _find_subfolder(Folders_obj[i].Folders, folder_search_name)
            print(Folders_obj[i].Name )
        if ret is not None:
            print(Folders_obj[i].Name + " " + ret)
            return ret
        else:
            continue


def _find_message_using_subject(messages, subject):
    for i in range(0, len(messages)):
        # print(messages[i].Subject, subject)
        if messages[i].Subject == subject:
            # print(messages[i])
            return messages[i]

def reply_email():
    outlook = win32com.client.Dispatch("Outlook.Application").GetNamespace("MAPI")
    sent_item_folder = "Sent Items1"
    _find_folder(outlook.folders, '')

    i = 1
    while i < 20:
        try:
            folder = outlook.GetDefaultFolder(i)
            print(folder.FolderPath )
            print(str(i))
            i += 1
        except:
            i += 1
    sent_item = outlook.GetDefaultFolder(5)
    messages = sent_item.Items
    subject = "WFH March 18 2023"
    message = _find_message_using_subject(messages, subject)
    if message is None:
        print("No message in sent item folder has the subject " + subject)
        return

    reply_mail = message.ReplyAll()

    reply_mail.Send()

def send_email():
    outlook = win32com.client.Dispatch("Outlook.Application")
    mail = outlook.CreateItem(0)
    mail.To = 'PETER EMMANUEL BARREDO (DEV-DIGITAL-ISD-OOCLL/MNL) <peter.emmanuel.barredo@oocl.com>'
    mail.Subject = 'WFH March 18 2023'
    mail.Body = "Plan to do"

    mail.Send()


if __name__ == '__main__':
    # send_email()
    reply_email()
