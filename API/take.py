# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
import traceback

import re 
import csv

# local files
from config import comSettings



# PURPOSE - create a resource for retrieving the daily take sheet
class DailyTake(Resource):

    def get(self):
        print("DailyTake Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        # print(reqDict)
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 

            # Set the basic response query
            sqlReq = 'SELECT * FROM DailyTake'

            # remove resID from parameters
            del reqDict["resID"]

            # If there are no arguments, set a basic request for all records
            if len(reqDict) == 0 :
                fullReq = '' + sqlReq + ''
                query = conn.execute(fullReq)
            # If there is one or more arguments, filter the request
            else:
                count = 1
                parReq = ""
                values = []
                # loop through the arguments to build the Where clause
                for field, value in reqDict.items():
                    if count == 1 :
                        parReq = ' WHERE ' + field + ' = ?'
                    else:
                        parReq = parReq + ' AND ' + field + ' = ?'
                    
                    # add the parameter value for the second part of the request
                    values.append(value)
                    count = count + 1
                # build the full query and send the request    
                fullReq = '' + sqlReq + parReq + ''
                # print(fullReq, values)
                query = conn.execute(fullReq, values) # This line performs query and returns json result
                #query = conn.execute(fullReq, tempValue) # This line performs query and returns json result
            # Loop through the DailyTake results to start building the additional fields
            dailyTakes = list()
            # newValues = {"DayOfWeek", "StaffTakes"} - delete?
            query.keys().append("DayOfWeek")
            query.keys().append("StaffTakes")
            query.keys().append("SumTakes")

            #Loop through the each daily take
            for i in query.cursor:
                Li=list(i)
                # find the ID for the DailyTake
                dtID = Li[query.keys().index("DailyTakeID")] 

                #get all the takes that make up the DailyTake sheet
                tRequest = "SELECT * FROM Take WHERE DailyTakeID = ?"
                tQuery = conn.execute(tRequest, dtID)
                tResult = {'Take': [dict(zip(tuple (tQuery.keys()) ,j)) for j in tQuery]}
                # print(tResult["Take"])
                # now get all the Staff Takes
                stRequest = "SELECT * FROM stafftakeview WHERE DailyTakeID = ?"
                stQuery = conn.execute(stRequest, dtID)
                stResult = {'StaffTake': [dict(zip(tuple (stQuery.keys()) ,k)) for k in stQuery]}
                # print(stResult["StaffTake"])
                
                # group the take sheets into staff sheets based on StaffTakeID
                # create a new dictionary for the stafftakeiD's - eg. {12323: ({},{}), 12345: ({},{})}
                stDict = {}
                sumsDict = {}
                # for each take sheet
                for take in tResult["Take"]: 
                    # load the stafftake id
                    stID = take["StaffTakeID"]
                    # check if the stafftake Id exists in the stafftake dict
                    if stID in stDict:
                        #if yes, add the take into the corresponding list value for the ID and seed it with the take
                        stDict[stID].append(take)
                    else:
                        #If not, add it to the dictionary, set it's first value to be a pair of the id and add the take into the list value
                        stDict[stID] = [take]
  
                    # as we're looping through the takes, also build the sumTakes list
                    payment = take["Payment"]
                    takeExp = take["Expected"]
                    takeAct = take["Actual"]

                    #build the list of payments first as an easily referencable dict
                    if payment in sumsDict:
                    #handle None types in data
                        payDict = sumsDict[payment]
                        try: 
                            newExp = takeExp + payDict["ExpSum"]
                        except: 
                            takeExp = 0
                            newExp = takeExp + payDict["ExpSum"]
                        try: 
                            newAct = takeAct + payDict["ActSum"]
                        except: 
                            takeAct = 0
                            newAct = takeAct + payDict["ActSum"]
                        diff = newExp - newAct
                        
                        newCount = payDict["Count"] + 1
                        newPayDict = {"ExpSum": newExp, "ActSum": newAct, "DiffSum": diff, "Count": newCount}
                        sumsDict[payment] = newPayDict

                    else: 
                        try: 
                            diff = takeExp - takeAct 
                        except: 
                            if takeExp == None or takeExp == "":
                                takeExp = 0
                            if takeAct == None or takeAct == "":
                                takeAct = 0 
                            diff = takeExp - takeAct
                        payDict = {"ExpSum": takeExp, "ActSum": takeAct, "DiffSum": diff, "Count": 1}
                        sumsDict[payment] = payDict
                
                # convert the sumsDict to be JSON friendly
                # print(sumsDict)
                sumTakes = {"SumTakes" : []}    
                for payment in sumsDict:
                    sumDict = {"Payment": payment}
                    sumDict.update(sumsDict[payment])
                    # print(sumDict)
                    sumTakes["SumTakes"].append(sumDict)

                # loop though the staff takes, add the take sheets
                for sTake in stResult["StaffTake"]:
                    sTakeID = sTake["StaffTakeID"]
                    takeList = stDict[sTakeID] 
                    sTake["Takes"] = takeList

                Li.append("Monday")
                Li.append(stResult["StaffTake"])
                Li.append(sumTakes["SumTakes"])
                i=tuple(Li)
                dailyTakes.append(i)
     
            result = {'DailyTake': [dict(zip(tuple (query.keys()) ,i)) for i in dailyTakes]}
            conn.close

            return jsonify(result)

        else:

            return jsonify("invalid request - no resid found")

    def patch(self):
            print("Daily Take Patch Requested")
            reqDict = dict(request.args)
            dbConfig = comSettings() 
        
            if "resID" not in reqDict:
                return jsonify("Database not specified")
            else:
                resID = reqDict["resID"]
                databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
                db = create_engine(databaseConnection)
                conn = db.connect() 
                aJSON = request.get_json(force=True)

                nowDate = datetime.now()

                # send the update for the daily take
                patchQuery = '''UPDATE DailyTake
                    SET GST = ?,
                        PST = ?, 
                        Budget = ?,
                        Net = ?,
                        ModDate = ?,
                        ModUser = ?
                    WHERE DailyTakeID = ?'''
                patchValues = (aJSON["GST"], 
                    aJSON["PST"], 
                    aJSON["Budget"], 
                    aJSON["Net"], 
                    nowDate,
                    aJSON["UserID"], 
                    aJSON["DailyTakeID"]) 
                conn.execute(patchQuery, patchValues)
                conn.close
                #empID = postResult.lastrowid
                #print(empID)
                return jsonify("Success")

    def post(self):
            print("Daily Take Post Requested")
            reqDict = dict(request.args)
            dbConfig = comSettings() 
        
            if "resID" not in reqDict:
                return jsonify("Database not specified")
            else:
                resID = reqDict["resID"]
                databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
                db = create_engine(databaseConnection)
                aJSON = request.get_json(force=True)
                print(aJSON)
                nowDate = datetime.now()

                #create the daily take 
                conn = db.connect()
                postQuery = '''INSERT INTO DailyTake (
                        Date,
                        Budget,
                        CreateDate,
                        CreateUser,
                        ModDate,
                        ModUser
                    ) VALUES (?,?,?,?,?,?)'''
                postValues = (aJSON["Date"], 
                    aJSON["Budget"],
                    nowDate, 
                    aJSON["UserID"], 
                    nowDate, 
                    aJSON["UserID"]) 
                postResult = conn.execute(postQuery, postValues)
                dtID = postResult.lastrowid
                return jsonify(dtID)

class StaffTake(Resource):

    def get(self):
        print("StaffTake Requested")
        reqDict = dict(request.args) 
        dbConfig = comSettings() 
        # print(reqDict)
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 

            # Set the basic response query
            sqlReq = 'SELECT * FROM StaffTakeView'

            # remove resID from parameters
            del reqDict["resID"]

            # If there are no arguments, set a basic request for all records
            if len(reqDict) == 0 :
                fullReq = '' + sqlReq + ''
                query = conn.execute(fullReq)
            # If there is one or more arguments, filter the request
            else:
                count = 1
                parReq = ""
                values = []
                # loop through the arguments to build the Where clause
                for field, value in reqDict.items():
                    if count == 1 :
                        parReq = ' WHERE ' + field + ' = ?'
                    else:
                        parReq = parReq + ' AND ' + field + ' = ?'
                    
                    # add the parameter value for the second part of the request
                    values.append(value)
                    count = count + 1
                # build the full query and send the request    
                fullReq = '' + sqlReq + parReq + ''
                # print(fullReq, values)
                query = conn.execute(fullReq, values) # This line performs query and returns json result

            #result = {'StaffTake': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            # Loop through the DailyTake results to start building the additional fields
            
            staffTakes = list()
            query.keys().append("Status") # calculated field
            query.keys().append("Takes")

            #Loop through the each daily take
            for i in query.cursor:
                Li=list(i)
                # find the ID for the DailyTake
                stID = Li[query.keys().index("StaffTakeID")] 
                #get all the takes that make up the DailyTake sheet
                tRequest = "SELECT * FROM Take WHERE StaffTakeID = ?"
                tQuery = conn.execute(tRequest, stID)
                tResult = {'Take': [dict(zip(tuple (tQuery.keys()) ,j)) for j in tQuery]}
                # figure out the status for the staff take
                stStatus = 0
                for take in tResult["Take"]:
                    # print(sTake)
                    if take["Status"] != 0 :
                        stStatus = 1

                Li.append(stStatus)
                Li.append(tResult["Take"])
                i=tuple(Li)
                staffTakes.append(i)
                # print(stResult)

            result = {'StaffTake': [dict(zip(tuple (query.keys()) ,i)) for i in staffTakes]}

            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")
    
    def patch(self):
            print("Staff Take Patch Requested")
            reqDict = dict(request.args)
            dbConfig = comSettings() 
        
            if "resID" not in reqDict:
                return jsonify("Database not specified")
            else:
                resID = reqDict["resID"]
                databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
                db = create_engine(databaseConnection)
                conn = db.connect() 
                aJSON = request.get_json(force=True)

                nowDate = datetime.now()

                # send the update for the daily take
                patchQuery = '''UPDATE StaffTake
                    SET DailyTakeID = ?,
                        StaffID = ?, 
                        Shift = ?,
                        ModDate = ?,
                        ModUser = ?
                    WHERE StaffTakeID = ?'''
                patchValues = (aJSON["DailyTakeID"], 
                    aJSON["StaffID"], 
                    aJSON["Shift"], 
                    nowDate,
                    aJSON["UserID"], 
                    aJSON["StaffTakeID"]) 
                conn.execute(patchQuery, patchValues)
                conn.close
                return jsonify("Success")

    def post(self):
            print("Staff Take Post Requested")
            reqDict = dict(request.args)
            dbConfig = comSettings() 
        
            if "resID" not in reqDict:
                return jsonify("Database not specified")
            else:
                resID = reqDict["resID"]
                databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
                db = create_engine(databaseConnection)
                aJSON = request.get_json(force=True)

                nowDate = datetime.now()

                #create the system setting
                conn = db.connect()
                postQuery = '''INSERT INTO StaffTake (
                        DailyTakeID,
                        StaffID,
                        Shift,
                        CreateDate,
                        CreateUser,
                        ModDate,
                        ModUser
                    ) VALUES (?,?,?,?,?,?,?)'''
                postValues = (aJSON["DailyTakeID"], 
                    aJSON["StaffID"],
                    aJSON["Shift"], 
                    nowDate, 
                    aJSON["UserID"], 
                    nowDate, 
                    aJSON["UserID"]) 
                postResult = conn.execute(postQuery, postValues)
                stID = postResult.lastrowid
                # get the list of Payments from the system  
                postResult = conn.execute("SELECT Value FROM System WHERE Key = ?", "Payments")
                # result = {'System': [dict(zip(tuple (postResult.keys()) ,i)) for i in postResult.cursor]}
                result = postResult.fetchone()
                payments = re.sub("[^\w]", " ",  result[0]).split() #convert to a list
                for i in payments:
                    postQuery = '''INSERT INTO Take (
                        StaffTakeID,
                        DailyTakeID,
                        Payment,
                        CreateDate,
                        CreateUser,
                        ModDate,
                        ModUser
                    ) VALUES (?,?,?,?,?,?,?)'''
                    postValues = (
                        stID, 
                        aJSON["DailyTakeID"], 
                        i,
                        nowDate, 
                        aJSON["UserID"], 
                        nowDate, 
                        aJSON["UserID"]) 
                    conn.execute(postQuery, postValues)
                conn.close
                return jsonify(stID)

class Take(Resource):

    def get(self):
        print("Take Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 

            # Set the basic response query
            sqlReq = 'SELECT * FROM Take'

            # remove resID from parameters
            del reqDict["resID"]

            # If there are no arguments, set a basic request for all records
            if len(reqDict) == 0 :
                fullReq = '' + sqlReq + ''
                query = conn.execute(fullReq)
            # If there is one or more arguments, filter the request
            else:
                count = 1
                parReq = ""
                values = []
                # loop through the arguments to build the Where clause
                for field, value in reqDict.items():
                    if count == 1 :
                        parReq = ' WHERE ' + field + ' = ?'
                    else:
                        parReq = parReq + ' AND ' + field + ' = ?'
                    
                    # add the parameter value for the second part of the request
                    values.append(value)
                    count = count + 1
                # build the full query and send the request    
                fullReq = '' + sqlReq + parReq + ''
                query = conn.execute(fullReq, values) # This line performs query and returns json result
            
            conn.close
            result = {'Take': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            return jsonify(result)

        else:
            return jsonify("invalid request - no resid found")
        
    def patch(self):
            print("Take Patch Requested")
            reqDict = dict(request.args)
            dbConfig = comSettings() 
        
            if "resID" not in reqDict:
                return jsonify("Database not specified")
            else:
                resID = reqDict["resID"]
                databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
                db = create_engine(databaseConnection)
                conn = db.connect() 
                aJSON = request.get_json(force=True)

                nowDate = datetime.now()

                # send the update for the take
                patchQuery = '''UPDATE Take
                    SET Expected = ?,
                        Actual = ?, 
                        Difference = ?,
                        Status = ?,
                        ModDate = ?,
                        ModUser = ?
                    WHERE TakeID = ?'''
                patchValues = (
                    aJSON["Expected"], 
                    aJSON["Actual"], 
                    aJSON["Difference"],
                    aJSON["Status"], 
                    nowDate,
                    aJSON["UserID"], 
                    aJSON["TakeID"]) 
                conn.execute(patchQuery, patchValues)
                conn.close
                return jsonify("Success")

class DailyTakeByDate(Resource):

    def get(self):
        print("Daily Take List Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 

            if "startdate" in reqDict and "enddate" in reqDict:
                startDate = reqDict["startdate"]
                endDate = reqDict["enddate"]
            else:
                return jsonify("Error - Dates were not specified")
            # Set the basic response query
            sqlReq = 'SELECT * FROM DailyTakeSum where Date >= ? AND Date <= ? ORDER BY Date'

            values = [startDate, endDate]
            query = conn.execute(sqlReq, values) # This line performs query and returns json result
            
            conn.close
            result = {'DailyTakes': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            return jsonify(result)

        else:
            return jsonify("invalid request - no resid found")

class ImportTake(Resource):
    
    def post(self):
        print("Import Take Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        
        #check for values in URL
        if "userID" not in reqDict:
            return jsonify("UserID not supplied")

        if "resID" not in reqDict:
            return jsonify("ResID not specified")

        userID = reqDict["userID"]
        resID = reqDict["resID"]
        f = request.files['file']

        fileLoc = dbConfig["importFilePath"] + "//" + resID + "//" + f.filename 
        f.save(fileLoc)

        dtFileTakes = readImport(fileLoc)
        if dtFileTakes == False:
            return ("Error processing file")
        else:
            # process the list of takes into a tree of DailyTakes, StaffTakes, and Payment Types
            convertTake_result = convertTakeList(dtFileTakes) 
            if convertTake_result["Status"] == True:
                dtDict = convertTake_result["Value"]["DailyTakes"]
            else:
                return jsonify(False)
            # prime the database
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            #print (dtDict[0])
            result = mergeDailyTakes(dtDict, conn, userID)
            return jsonify(True)