# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
# local files
from config import comSettings

def getSetting(dbStr, setting):

    db = create_engine(dbStr)
    conn = db.connect() 
    sqlReq = 'SELECT Value FROM System WHERE Key = ' + setting
    query = conn.execute(fullReq)
    conn.close
    return(query)

# PURPOSE - create a resource to pull general setting for the restaurant
class System(Resource):

    def get(self):
        print("System Request")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 

            # Set the basic response query
            sqlReq = 'SELECT * FROM System'

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

            result = {'System': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)

        else:

            return jsonify("invalid request - no resid found")

    def post(self):
            print("System Post Requested")
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
                postQuery = '''INSERT INTO System (
                        Key,
                        Value,
                        CreateDate,
                        CreateUser,
                        ModDate,
                        ModUser
                    ) VALUES (?,?,?,?,?,?)'''
                postValues = (aJSON["Key"], 
                    aJSON["Value"], 
                    nowDate, 1, nowDate, 1) 
                postResult = conn.execute(postQuery, postValues)
                conn.close
                empID = postResult.lastrowid
                print(empID)
                return jsonify(empID)
            
            # if there is a matching email found, then raise the error 
