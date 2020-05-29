from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime

#local files
from config import comSettings
from admin import User, Restaurant, Employee, Login
from take import DailyTake, StaffTake, Take


app = Flask(__name__)
CORS(app)
api = Api(app)

#load main database as a global variable
class Ping(Resource):
    # PURPOSE - return table names for testing service
    #  ARGS - <none> 
    #  Returns - table names
    try:
        print("Connecting to database")
        dbConfig = comSettings() 
        db_main = create_engine(dbConfig["dbFilePath"] + 'main.db')
    except:
        print("Failed to connect to database")

    def get(self):
        print("Ping requested")
        reqDict = request.args 
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            databaseConnection = 'sqlite:///c:\\Projects\\SweetPickle\\DATA\\' + resID + '.db'
            print("Connecting to database")
            db = create_engine(databaseConnection)
            conn = db.connect() 
            query = conn.execute("SELECT * FROM System")
            result = {'System': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}

            return jsonify(result)

        else:
            tblNames = db_connect.table_names()
            return jsonify(tblNames)

#full list of API endpoints
api.add_resource(Ping, '/ping', methods=['GET'])
api.add_resource(User, '/user', methods=['GET','POST','PATCH'])
api.add_resource(Restaurant, '/restaurant', methods=['GET','POST'])
api.add_resource(Employee, '/employee', methods=['GET', 'POST'])
api.add_resource(Login, '/login', methods=['PATCH'])
api.add_resource(DailyTake, '/dailytake', methods=['GET'])
api.add_resource(StaffTake, '/dailytake/stafftake', methods=['GET'])
api.add_resource(Take, '/dailytake/stafftake/take', methods=['GET'])

if __name__ == '__main__':
     app.run(port='5003')
