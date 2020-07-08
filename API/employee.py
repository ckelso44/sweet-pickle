# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
# local files
from config import comSettings

# PURPOSE - create a resource for retrieving the daily take sheet
class Employees(Resource):

    def get(self):
        print("All Employees Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            databaseConnection = 'sqlite:///c:\\Projects\\SweetPickle\\DATA\\' + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM Employee")
            result = {'Employees': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")

class ActiveEmployees(Resource):

    def get(self):
        print("Active Employees Requested")
        reqDict = request.args 
        
        if "resID" in request.args:
            resID = request.args["resID"]
            databaseConnection = 'sqlite:///c:\\Projects\\SweetPickle\\DATA\\' + resID + '.db'
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT EmployeeID, FullName FROM Employee WHERE Active = ?","True")
            result = {'Employees': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify("invalid request - no resid found")
    
        #conn = db_connect.connect() # connect to database


# 1000001
#UPDATE Take SET Expected = (SELECT SUM(Expected)FROM TakeDetail WHERE Take.TakeID=TakeDetail.TakeID)