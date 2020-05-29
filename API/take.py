# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
# local files
from config import comSettings

# PURPOSE - creae a resource for retrieving the daily take sheet
class DailyTake(Resource):

    def get(self):
        print("DailyTake Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        print(reqDict)
        
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
                # build the full query and send the requet    
                fullReq = '' + sqlReq + parReq + ''
                query = conn.execute(fullReq, values) # This line performs query and returns json result

            result = {'DailyTake': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)

        else:

            return jsonify("invalid request - no resid found")

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