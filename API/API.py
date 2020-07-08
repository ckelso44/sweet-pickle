from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime

#local files
from config import comSettings
from admin import User, Restaurant, Employee, Login
from take import DailyTake, StaffTake, Take, DailyTakeByDate
from system import System
from employee import Employees, ActiveEmployees

app = Flask(__name__)
CORS(app)
api = Api(app)

#load main database as a global variable
class Ping(Resource):
    # PURPOSE - return table names for testing service
    #  ARGS - <none> 
    #  Returns - table names

    def get(self):
        print("Ping requested")
        reqDict = request.args
        dbConfig = comSettings()  
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            print("Connecting to database: " + resID)
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM System")
            result = {'System': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close

            return jsonify(result)

        else:
            print("Connecting to main database")
            dbConfig = comSettings() 
            db_main = create_engine(dbConfig["dbFilePath"] + 'main.db')
            conn = db_main.connect()
            tblNames = db_main.table_names()
            conn.close
            return jsonify(tblNames)

#full list of API endpoints
api.add_resource(Ping, '/ping', methods=['GET'])
api.add_resource(User, '/user', methods=['GET','POST','PATCH'])
api.add_resource(Restaurant, '/restaurant', methods=['GET','POST'])
api.add_resource(Employee, '/employee', methods=['GET', 'POST'])
api.add_resource(Employees, '/employees', methods=['GET', 'POST'])
api.add_resource(ActiveEmployees, '/employees/active', methods=['GET'])
api.add_resource(Login, '/login', methods=['PATCH'])
api.add_resource(DailyTake, '/dailytake', methods=['GET', 'PATCH', 'POST'])
api.add_resource(StaffTake, '/dailytake/stafftake', methods=['GET', 'POST', 'PATCH'])
api.add_resource(Take, '/dailytake/stafftake/take', methods=['GET', 'PATCH'])
api.add_resource(DailyTakeByDate, '/dailytake/bydate', methods=['GET'])
api.add_resource(System, '/system', methods=['GET', 'POST'])

if __name__ == '__main__':
     app.run(port='5003')
