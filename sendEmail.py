import yagmail
import pandas as pd
from pandas import DataFrame as df
import time
import datetime
import sys
from apscheduler.schedulers.blocking import BlockingScheduler

##Set up email to send from
yag= yagmail.SMTP('umn.test.email.me', 'TestingEmail9')

##import csv with names and emails
info = pd.read_excel('email-list.xlsx')

##Create lists from csv   
email_list = info['email'].tolist()
name_list = info['name'].tolist()
contacts = dict(zip(email_list,name_list))

##Message to be sent in email
message = 'Dear {},\n\nThis is a test email for you.\n\nBest,\nEric'

##Start the schdeuler
sched = BlockingScheduler()

def main():
    email_count = 1  
    sched.add_job(lambda: send_emails(contacts, email_count), 'cron', minute= '*/2')

    print('Sending emails...')
    sched.start()
    
    if email_count == 2:
        sched.shutdown()
        print('Closing Program')
        sys.exit()

##Send email job
def send_emails(contacts, email_count):
    for contact in contacts:
        yag.send(to = contact, subject = 'Testing', contents = message.format(contacts[contact]))
    currentDT = datetime.datetime.now()
    print('Emails sent at: ' + currentDT.strftime('%Y-%m-%d %H:%M:%S'))
    email_count += 1

##Shutdown job
def sdown():
    print('Shutting down.')
    sched.shutdown()

if __name__ == '__main__':
    main()



