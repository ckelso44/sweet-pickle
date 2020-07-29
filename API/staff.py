# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
# local files
from config import comSettings

# PURPOSE - create a resource for staff members at the restaurant
class Staff(Resource):

    def get(self):
        print("All Staff Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            dbConfig = comSettings()
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM Staff")
            result = {'Staff': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")

class ActiveStaff(Resource):

    def get(self):
        print("Active Staff Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            dbConfig = comSettings()
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT StaffID, FullName FROM Staff WHERE Active = ?","True")
            result = {'Staff': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")
    
        #conn = db_connect.connect() # connect to database


# 1000001
#UPDATE Take SET Expected = (SELECT SUM(Expected)FROM TakeDetail WHERE Take.TakeID=TakeDetail.TakeID)