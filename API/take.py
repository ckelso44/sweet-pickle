# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
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
                stRequest = "SELECT * FROM StaffTake WHERE DailyTakeID = ?"
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
                    # print(take)
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
                    #print(payment)
                    #print(take)
                    #print(sumsDict)
                    
                    #handle None types in data
                    takeExp = take["Expected"]
                    if takeExp == None: 
                        takeExp = 0
                    
                    takeAct = take["Actual"]
                    if takeAct == None:
                        takeAct = 0

                    #build the list of payments first as an easily referencable dict
                    if payment in sumsDict:
                        payDict = sumsDict[payment]
                        newExp = takeExp + payDict["ExpSum"]
                        newAct = takeAct + payDict["ActSum"]
                        diff = newExp - newAct
                        newCount = payDict["Count"] + 1
                        newPayDict = {"ExpSum": newExp, "ActSum": newAct, "DiffSum": diff, "Count": newCount}
                        sumsDict[payment] = newPayDict

                    else: 
                        diff = take["Expected"] - take["Actual"] 
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

                # print(sumTakes)

                # loop though the staff takes, add the take sheets
                for sTake in stResult["StaffTake"]:
                    # print(sTake)
                    sTakeID = sTake["StaffTakeID"]
                    takeList = stDict[sTakeID] 
                    sTake["Takes"] = takeList

                Li.append("Monday")
                # print(stDict)
                Li.append(stResult["StaffTake"])
                Li.append(sumTakes["SumTakes"])
                i=tuple(Li)
                dailyTakes.append(i)
                # print(stResult)

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
                postResult = conn.execute(patchQuery, patchValues)
                conn.close
                #empID = postResult.lastrowid
                #print(empID)
                return jsonify("Success")


class StaffTake(Resource):

    def get(self):
        print("StaffTake Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            databaseConnection = 'sqlite:///c:\\Projects\\SweetPickle\\DATA\\' + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM StaffTake")
            result = {'StaffTake': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")

class Take(Resource):

    def get(self):
        print("Take Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            databaseConnection = 'sqlite:///c:\\Projects\\SweetPickle\\DATA\\' + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM Take")
            result = {'Take': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")
    
        #conn = db_connect.connect() # connect to database


# 1000001
#UPDATE Take SET Expected = (SELECT SUM(Expected)FROM TakeDetail WHERE Take.TakeID=TakeDetail.TakeID)