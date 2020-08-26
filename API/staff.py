# define the API's primarily used for the restaurant requests
from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from flask_cors import CORS
from sqlalchemy import create_engine
from datetime import datetime
# local files
from config import comSettings
from admin import User, Employee

# PURPOSE - create a resource for staff members at the restaurant
class Staff(Resource):

    def get(self):
        print("All Staff Requested")
        reqDict = dict(request.args) 
        
        if "resID" in reqDict:
            resID = reqDict["resID"]
            dbConfig = comSettings()
            databaseConnection = dbConfig["dbFilePath"] + resID + '.db'
            print(databaseConnection)
            db = create_engine(databaseConnection)
            conn = db.connect() 

            # Set the basic response query
            sqlReq = 'SELECT * FROM Staff'

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


            result = {'Staff': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            conn.close
            return jsonify(result)
        else:
            return jsonify(False)

    def post(self):
        print("Staff Post Requested")
        reqDict = dict(request.args)
        dbConfig = comSettings() 
        print ("I am here")
        result = {'status': 'incomplete', 'message': 'No action taken','value': 'none'}

        if "resID" not in reqDict:
            result['status'] = "Error"
            result['message'] = "Database not specified" 
            return jsonify(result)
        else:
            resID = reqDict["resID"]
            aJSON = request.get_json(force=True)
            nowDate = datetime.now()
            userID = ""

            # create a login if requested
            if aJSON["Login"] == True:
                # connect to the main database
                databaseConnection = dbConfig["dbFilePath"] + "main" + '.db'
                db = create_engine(databaseConnection)
                conn = db.connect()
                # if a email was defined
                uEmail = aJSON["Email"]
                uName = aJSON["UserName"]
                print(uEmail)
                if uEmail != None and uEmail != "" :
                    # look for a user with that email
                    query = 'SELECT UserID FROM Users WHERE Email = ?'
                    qResult = conn.execute(query, uEmail)
                    conn.close
                    records = qResult.fetchall()
                    print(records)
                    if len(records) == 0 :
                        print("No login found")
                        # create an email based login
                        newUser = User.post(jsonify(aJSON))
                        userID = newUser.get_json(force=True)
                        print(userID)
                        result['message'] = "An new user was created."
                        # create a link Employee record
                    else:
                        record = records[0]
                        userID = record[0]    
                        # check if a employee record already exists for that user
                        query = 'SELECT EmployeeID FROM Employees WHERE UserID = ? AND RestaurantID = ?'
                        values = (userID, resID)
                        qResult = conn.execute(query, values)
                        conn.close
                        records = qResult.fetchall()
                        print(records)
                        if len(records) > 0 :
                            result['status'] = "Error"
                            result['message'] = "An employee record with that UserID already exists for this restaurant. Talk to your admin or support if necessary."
                            return jsonify(result)
                        result['message'] = "An existing user with that email was connected to the restaurant."                            
                elif uName != None and uName != "" :
                    # look for a user with that UserName
                    query = 'SELECT UserID FROM UserView WHERE UserName = ? AND RestaurantID = ?'
                    values = (uName, resID)
                    qResult = conn.execute(query, values)
                    conn.close
                    records = qResult.fetchall()
                    print(records)
                    if len(records) == 0 :
                        print("No login found")
                        # create an userName based login
                        newUser = User.post(jsonify(aJSON))
                        userID = newUser.get_json(force=True)
                        print(userID)
                        result['message'] = "An new user was created."
                        # create a link Employee record
                    else:
                        result['status'] = "Error"
                        result['message'] = "An employee record with that User Name already exists for this restaurant. Talk to your admin or support if necessary."
                        return jsonify(result)
  
                    aJSON.update({"UserID": userID, "RestaurantID": resID})
                    print (aJSON)
                    newStaff = Employee.post(jsonify(aJSON))
                    staffData = newStaff.get_json(force=True)
                    staffID = staffData["StaffID"]
                    print(staffID) 
            else:
                #create a new staff member without a login
                db_connect = create_engine(dbConfig["dbFilePath"] + resID + '.db')
                conn = db_connect.connect()
                postQuery = '''INSERT INTO Staff (
                        FullName,
                        PrefName,
                        Status, 
                        Active,
                        CreateDate,
                        CreateUser,
                        ModDate,
                        ModUser 
                    ) VALUES (?,?,?,?,?,?,?,?)'''
                postValues = (
                    aJSON["FullName"], 
                    aJSON["PrefName"], 
                    "New", 
                    True, 
                    nowDate,
                    aJSON['ModUser'], 
                    nowDate, 
                    aJSON['ModUser']) 
            
            postResult = conn.execute(postQuery, postValues)
            conn.close
            staffID = postResult.lastrowid
            result['message'] = "A new staff member was created"

        result['status'] = "Success"
        result['value'] = staffID
        return jsonify(result)

    def patch(self):
        print("Staff Patch Requested")
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

            # send the update for the staff
            patchQuery = '''UPDATE Staff
                SET FullName = ?,
                    PrefName = ?, 
                    Status = ?,
                    Active = ?,
                    ModDate = ?,
                    ModUser = ?
                WHERE StaffID = ?'''
            patchValues = (aJSON["FullName"], 
                aJSON["PrefName"], 
                aJSON["Status"], 
                aJSON["Active"], 
                nowDate,
                aJSON["ModUser"], 
                aJSON["StaffID"]) 
            conn.execute(patchQuery, patchValues)
            conn.close
            #empID = postResult.lastrowid
            #print(empID)
            return jsonify("Success")



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