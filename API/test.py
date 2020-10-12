from sqlalchemy import create_engine
from flask import Flask, request, jsonify
import re
# local files
from config import comSettings


def myfunction() :
    print("Hello World")
    strTest = '''["Hello", "my", "world"]'''
    strTest2 = '''"Hello", "my", "world"'''
    strTest3 = "Cash P/O Credit Cash"
    print (strTest3.split())
    wordList = re.sub("[^\w]", " ",  strTest).split()
    print (wordList)
    

# myfunction()


from datetime import datetime

def testDate():
    # Define dates as strings
    date_str1 = 'Wednesday, June 6, 2018'
    date_str2 = '6/6/18'
    date_str3 = '06-06-2018'
    date_str4 = '8/16/2020 12:03'

    # Define dates as datetime objects
    date_dt1 = datetime.strptime(date_str1, '%A, %B %d, %Y')
    date_dt2 = datetime.strptime(date_str2, '%m/%d/%y')
    date_dt3 = datetime.strptime(date_str3, '%m-%d-%Y')
    date_dt4 = datetime.strptime(date_str4, '%m/%d/%Y %H:%M').date()

    # Print converted dates
    print(date_dt1)
    print(date_dt2)
    print(date_dt3)
    print(date_dt4)
    print (date_dt4.strftime('%Y-%m-%d'))


def testConnection() :
    """ function to create a connection to a sample restaurant database for
    Parameters
    -----------
    None

    Returns
    -----------
    conn : database connection
    """
    dbConfig = comSettings() 
    databaseConnection = dbConfig["dbFilePath"] + '1000001' + '.db'
    db = create_engine(databaseConnection)
    conn = db.connect()
    print("Created connection to test database - don't forget to close!")
    return conn 

# runTakeTest()
# test_getStaffTakeID()
# test_createStaffTake()