# server functions used to import takes from a CSV into a standard DailyTake, StaffTakes, Take format

import csv
import traceback
from datetime import datetime
from test import testConnection

def createTake(tData, conn):
    """Creates a new take based on the data supplied.
    Parameters
    ----------
    tData : data to create the basic Take
    conn : database connection to use for queries

    Returns
    ----------
    Dictionary :  
        Status: True or False
        Value: expected outcome if true (staffID), or error message
    """
    # Set the basic response query
    nowDate = datetime.now()
    # check for required fields
    if "dtID" not in tData or "stID" not in tData or "payment" not in tData or "userID" not in tData:
        result = {"Status": False, "Value": "There was missing required data in the request"}
        return result
    
    if "expected" not in tData:
        expected = None
    else: expected = tData["expected"]

    if "actual" not in tData:
        actual = None
    else: actual = tData["actual"]

    if expected == None or actual == None:
        difference = None
        status = 1
    else:
        difference = round(actual-expected,2)
        status = 0
    
    
    #create the take 
    postQuery = '''INSERT INTO Take (
            StaffTakeID,
            DailyTakeID,
            Expected,
            Actual,
            Difference,
            Status,
            Payment,
            CreateDate,
            CreateUser,
            ModDate,
            ModUser
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)'''
    postValues = (tData["stID"], 
        tData["dtID"],
        expected,
        actual,
        difference,
        status,
        tData["payment"],
        nowDate, 
        tData["userID"], 
        nowDate, 
        tData["userID"]) 
    try: 
        postResult = conn.execute(postQuery, postValues)
        tID = postResult.lastrowid
        result = {"Status": True, "Value": tID}
    except Exception: 
        # traceback.print_exc()
        result = {"Status": False, "Value": "Unable to create the staff Take, database error"}
    
    return result

def setTake(tData, conn):
    """Looks for a Take with the payment and returns the ID, or asks to create a Take to return.
    Parameters
    ----------
    tData : dictionary including:
        stID : ID for the StaffTake
        payment : name of payment name to lookup
        expected: amount from the POS for the payment type
        userID : users ID if a new take needs to be created
    conn : database connection to use for queries

    Returns
    ----------
    takeID : ID for the existing for staffTakes that can be used for the takes, or False if there was an error finding or creating one
    """
    sqlReq = 'SELECT * FROM Take where StaffTakeID = ? AND Payment = ?'
    postValues = (tData["stID"], tData["payment"])
    query = conn.execute(sqlReq, postValues)
    row = query.fetchone()

    if row is None:
        print ("going to create a new take")
        createResult = createTake(tData, conn)
        if createResult["Status"] == True:
            result = {"Status": True, "Result": "Successfully created new Take" + createResult["Value"]}
        else: result = createResult
    else:
        print ("going to update existing take")
        takeID = row[0]
        sqlReq = 'UPDATE Take SET Expected = Expected + ? WHERE TakeID = ?'
        postValues = (tData["expected"],takeID)
        try:
            result = conn.execute(sqlReq, postValues)
            message = "Updated Take sheet"
            result = {"Status": True, "Value": message}
        except Exception: 
            traceback.print_exc() 
            message = "Failed to update take record - database error"
            result = {"Status": False, "Value": message}
    return result

def createStaffTake(stData, conn):
    """Creates a new staff take based on the data supplied.
    Parameters
    ----------
    stData : data to create the basic DailyTake
    conn : database connection to use for queries

    Returns
    ----------
    Dictionary :  
        Status: True or False
        Value: expected outcome if true (staffID), or error message
    """
    # Set the basic response query
    nowDate = datetime.now()
    # check for required fields
    if "dtID" not in stData or "staffName" not in stData or "userID" not in stData:
        result = {"Status": False, "Value": "There was missing required data in the request"}
        return result

    if "shift" not in stData:
        stShift = None
    else: stShift = stData["shift"]

    # find the staffID based on the imported name
    sqlReq = 'SELECT StaffID FROM Staff where FullName = ?'
    query = conn.execute(sqlReq, stData["staffName"])
    row = query.fetchone()
    if row == None :
        result = {"Staus": False, "Value": "There was no staff member found for that name"}
        return result
    else: staffID = row[0]
    
    print (f"Staff ID:  {staffID}")

    #create the daily take 
    postQuery = '''INSERT INTO StaffTake (
            DailyTakeID,
            StaffID,
            Shift,
            CreateDate,
            CreateUser,
            ModDate,
            ModUser
        ) VALUES (?,?,?,?,?,?,?)'''
    postValues = (stData["dtID"], 
        staffID,
        stShift,
        nowDate, 
        stData["userID"], 
        nowDate, 
        stData["userID"]) 
    try: 
        postResult = conn.execute(postQuery, postValues)
        stID = postResult.lastrowid
        result = {"Status": True, "Value": stID}
    except Exception: 
        traceback.print_exc()
        result = {"Status": False, "Value": "Unable to create the staff Take, database error"}
    
    return result

def getStaffTakeID(stData, conn):
    """Looks for a dailyTake with that date and returns the ID, or asks to create a new Daily Take to return.
    Parameters
    ----------
    stData : dictionary including:
        dtID : ID for the DailyTake
        staffName : name of staff member to lookup
        userID : users ID if a new take needs to be created
    conn : database connection to use for queries

    Returns
    ----------
    staffTakes : Status of True if there ID created, the the Value of the ID
    """

    sqlReq = 'SELECT * FROM StaffTakeView where DailyTakeID = ? AND FullName = ?'
    postValues = (stData["dtID"], stData["staffName"])
    query = conn.execute(sqlReq, postValues)
    row = query.fetchone()

    if row is None:
        result = createStaffTake(stData, conn)
    else:
        result = {"Status": True, "Value": row[0]}
    return result

def createDailyTake(dtData, conn):
    """Creates a new daily take based on the data supplied.

    Parameters
    ----------
    dtData : data to create the basic DailyTake
    conn : database connection to use for queries

    Returns
    ----------
    dtID : ID of the dailytake to use, or False if there was an error finding or creating one

    """
    # Set the basic response query
    nowDate = datetime.now()
    # check for required fields
    if "Date" not in dtData or "UserID" not in dtData:
        return False

    if "Budget" not in dtData:
        dtBudget = ""
    else: dtBudget = dtData["Budget"]

    #create the daily take 
    postQuery = '''INSERT INTO DailyTake (
            Date,
            Budget,
            CreateDate,
            CreateUser,
            ModDate,
            ModUser
        ) VALUES (?,?,?,?,?,?)'''
    postValues = (dtData["Date"], 
        dtBudget,
        nowDate, 
        dtData["UserID"], 
        nowDate, 
        dtData["UserID"]) 
    try: 
        postResult = conn.execute(postQuery, postValues)
        result = postResult.lastrowid
    except Exception: 
        # traceback.print_exc()
        result = False

    return result

def getDailyTakeID(dtDate, conn, userID):
    """Looks for a dailyTake with that date and returns the ID, or asks to create a new Daily Take to return.

    Parameters
    ----------
    dtDate : date to use to look for a DailyTake
    conn : database connection to use for queries
    userID : users ID if a new take needs to be created

    Returns
    ----------
    dtID : ID of the dailytake to use, or False if there was an error finding or creating one

    """
    # Set the basic response query
    sqlReq = 'SELECT * FROM DailyTake where Date = ?'
    query = conn.execute(sqlReq, dtDate)
    row = query.fetchone()
    if row is None:
        dtData = {"Date": dtDate, "UserID": userID}
        dtID = createDailyTake(dtData, conn)
        return dtID
    else:
        dtID = row[0]
        return dtID

def format_Date(date_im):
    date_rt = datetime.strptime(date_im, '%m/%d/%Y %H:%M').date()
    return date_rt.strftime('%Y-%m-%d')

def format_CurToFloat(curString):
    # formats a string with a preceeding $ character to a float
    pos = curString.find("$")
    newValue = float(curString[pos + 1:])
    return (newValue)

def checkFile(cFile):
    # check if the file matches expected header - note in the future this will compare to a stored template
    
    lines = list()
    with open(cFile, 'r') as csv_file:
        csv_check = csv.reader(csv_file, delimiter=',')
        #check the first line, if it's fine, leave it alone, otherwise try to 'fix' it by stripping bad first rows
        header = next(csv_check)
        if header[0] == 'Name':
            return True
        else:
            valid = False
            for row in csv_check:
                # look for the first row that is a valid header
                if valid == False:
                    if row[0] == "Name":
                        # add this as the first header
                        lines.append(row)
                        valid = True
                    else: 
                        # continue to add all the other rows after 
                        continue
                else: 
                    # check if the line is a summary for the report
                    if "REPORT SUMMARY" in row[0]:
                        break
                    else: lines.append(row)
            csv_file.close
            if len(lines) > 0 : # check if anything was actually written to the file
                # write the file
                with open(cFile, 'w') as writeFile:
                    writer = csv.writer(writeFile)
                    writer.writerows(lines)
                writeFile.close
                return True
            else: 
                return False

# Merge a list of DailyTakes into the database of existing files
def mergeDailyTakes(dtDict, conn, userID):
    # process each dailytake found in the list
    for dailyTake in dtDict["DailyTakes"]:
        # look for DailyTake, if none found, create one
        print(dailyTake)

        dtID = getDailyTakeID(dailyTake["Date"], conn, userID)
        if dtID != False:
            # print(dtID)
            for staffTake in dailyTake["StaffTakes"]:
                #print(staffTake)
                stData = {"staffName": staffTake["Name"], "dtID": dtID, "userID": userID}
                stID = getStaffTakeID(stData, conn)
                if stID != False:
                    print(stID)
                    for take in staffTake["Takes"]:
                        tData = {"payment": take["Payment"], "stID": stID, "dtID": dtID, "userID": userID, 'expected': take["Expected"]}
                       # tID = getTakeID(tData, conn)
                        #if tID != False:
                         #   print (tID)
                else: return False

        else: return False
        print(dtID)
    return True

def convertTakeList(takeList):
    dailyTakeSort = {"DailyTakes": []}
    # sort daily takes by Bill date
    for row in takeList:
        billDate = format_Date(row['Bill Date']) # grab the billing date
        staff = row['Staff']
        payment = row['Name']
        expected = format_CurToFloat(row["Applied to Bill"])

        dailyTakes = dailyTakeSort["DailyTakes"]
        #print (dailyTakes)

        found_dTake = False
        for dTake in dailyTakes:
            if dTake["Date"] == billDate:
                staffTakes = dTake["StaffTakes"]
                found_staffTake = False
                for staffTake in staffTakes:
                    if staffTake["Name"] == staff:
                        takes = staffTake["Takes"]
                        found_take = False
                        for take in takes:
                            if take["Payment"] == payment:
                                take["Expected"] = round(take["Expected"] + expected, 2)
                                found_take = True
                                break
                        
                        if found_take == False:
                            newTake = {"Payment": payment, "Expected": expected}
                            staffTake["Takes"].append(newTake)
                        
                        found_staffTake = True
                        break
                
                if found_staffTake == False:
                    newStaffTake = {"Name": staff, "Takes": [{"Payment": payment, "Expected": expected}]}
                    dTake["StaffTakes"].append(newStaffTake)

                found_dTake = True
                break
        # If not found, add the row as a new entry 
        if found_dTake == False:
            newDailyTake = {"Date": billDate, "StaffTakes": [{"Name": staff, "Takes": [{"Payment": payment, "Expected": expected}]}]}
            dailyTakes.append(newDailyTake)

    return {"Status": True, "Value": dailyTakeSort}

def readImport(tFile):
      # check first if it is a valid file by looking at the header row
    validation = checkFile(tFile)

    print (validation) 
    # read the file as a dictionary to process
    if validation == True:
        dTakes = []
        with open(tFile) as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                dTakes.append(row)
            result = {"Status": True, "Value": dTakes, "Message": "Successfully imported from file"}
    else:
        result = {"Status": False, "Value": "Invalid file location or format"}

    return result

#------------------------- TEST SCRIPTS ----------------------------------------------------------

sample_dtList = {"dtTakes": [{"dt_Date": "2020-01-02","StaffTakes": [{"StaffMember": "Colleen", "Takes": [
            {'Name': 'Cash', 'Applied to Bill': '$23.63', 'Tip': '$0.00', 'Payment Amount': '$23.63', 'CC Tip Out to House': '', 'Change': '$6.37', 'Type': 'Full Payment', 'Subtotal with Tax': '$23.63', 'Gratuity': '$0.00', 'Bill Date': '8/16/2020 12:03', 'Bill Number': '1701', 'Order Number': '1517', 'Staff': 'Soyun'}, 
            {'Name': 'Visa', 'Applied to Bill': '$51.25', 'Tip': '$10.25', 'Payment Amount': '$61.50', 'CC Tip Out to House': '', 'Change': '$0.00', 'Type': 'Full Payment', 'Subtotal with Tax': '$51.25', 'Gratuity': '$0.00', 'Bill Date': '8/16/2020 12:03', 'Bill Number': '1702', 'Order Number': '1518', 'Staff': 'Julien'}, 
            {'Name': 'Debit', 'Applied to Bill': '$44.10', 'Tip': '$0.00', 'Payment Amount': '$44.10', 'CC Tip Out to House': '', 'Change': '$0.00', 'Type': 'Full Payment', 'Subtotal with Tax': '$44.10', 'Gratuity': '$0.00', 'Bill Date': '8/16/2020 12:16', 'Bill Number': '1703', 'Order Number': '1519', 'Staff': 'Codi'}
        ]}]
    }]
}

def test_readImport():
    # check for a valid file can be read into a dict
    fileLoc = "C:\Projects\Test\elsegundo-PaymentDetails-2020-08-16-2020-08-22_edit_dates_short.csv" 

    dtFileTakes = readImport(fileLoc)
    print (f"Results of importing a valid file: {dtFileTakes}")

    fileLoc = "C:\Projects\Test\HelloWorld2.txt"
    dtFileTakes = readImport(fileLoc)
    print (f"Results of importing a invalid file: {dtFileTakes}")

def test_convertFile():
    # test that the conversion will work from a valid file
    fileLoc = "C:\Projects\Test\elsegundo-PaymentDetails-2020-08-16-2020-08-22_edit_dates_short.csv" 
    dtFileTakes = readImport(fileLoc)
    if dtFileTakes["Status"]:
        fileTakes = dtFileTakes["Value"]
    else: print("Fail on import")
    #print(fileTakes)
    result = convertTakeList(fileTakes)
    # print(result)
    return result

def test_format_CurToFloat():
    testValue = "$10.12"
    result = format_CurToFloat(testValue)
    print (result)

def test_mergeDailyTakes():
    ''' Purpose : test mergeDailyTakes file is able to properly merge a formatted list of DailyTakes into the database
            Data required: dtDict, conn, userID
            Expected results Status: True, or Status: False and Message
    '''
    dtDict = test_convertFile()
    conn = testConnection()
    userID = 88888888

    result = mergeDailyTakes(dtDict['Value'], conn, userID)
    print(result)

def test_createTake():
    ''' Purpose : test createTake  is able to generically create a new take record for a given staffTake and dailyTake
            Data required: dtDict, conn, userID
            Expected results Status: True, or Status: False and Message
    '''
    conn = testConnection()
    userID = 888888

    # test full Take
    tDict = {"stID": 1184, "dtID": 2287, "expected": 345.67, "actual": 340.22, "payment": "Test Cash", "userID": userID}
    test_result = createTake(tDict, conn)
    print (f"Expected Results Status : True, Actual Results: {test_result}")
    conn.close

def test_setTake():
    ''' Purpose : test createTake  is able to generically create a new take record for a given staffTake and dailyTake
            Data required: dtDict, conn, userID
            Expected results Status: True, or Status: False and Message
    '''
    conn = testConnection()
    userID = 888888

    # test full Take
    tDict = {"stID": 1184, "dtID": 2287, "expected": 345.67, "payment": "Test Cash", "userID": userID}
    test_result = setTake(tDict, conn)
    print (f"Expected Results Status : True, Actual Results: {test_result}")
    conn.close

test_setTake()
#test_createTake()
#test_readImport()
#test_convertFile()
#test_format_CurToFloat()
#test_mergeDailyTakes()
