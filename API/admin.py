from flask import Flask, request, jsonify
from flask_restful import Resource, Api
from sqlalchemy import create_engine
from datetime import datetime

db_connect = create_engine('sqlite:///c:\\Projects\\SweetPickle\\DATA\\main.db')


# PURPOSE - provide a resource for managing restaurant profiles
class Employee(Resource):

    # PURPOSE - provide a method to retrieve employee information
    #  ARGS - <none>: returns all restaurants 
    #   ResID: returns single record based on resID 
    #   Name: returns single record based on Name 
    #  Returns - RestaurantID, Name, Address, Standard Record Details
    def get(self):
        print("Employees requested")
        conn = db_connect.connect() # connect to database
        reqDict = request.args 

        sqlReq = 'SELECT EmployeeID, UserID, RestaurantID, Active, Name FROM EmpView'
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

        # Return the results
        result = {'Employees': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
        conn.close
        return jsonify(result)

    # PURPOSE - provide a method to post a new Employee
    #  ARGS - <none>
    #  Returns -    ID: Restaurant ID when created successfully; 
    #               FALSE: User not created
    def post(self):
        print("Post Employee requested")
        aJSON = request.get_json(force=True)

        # ++ validate name is unique
        conn = db_connect.connect()
        postResult = conn.execute('SELECT EmployeeID from Employees WHERE UserID =? AND RestaurantID =?', (aJSON["UserID"], aJSON['RestaurantID'])) # Search for other restuarants with this name
        row = postResult.fetchone()

        # if no record with the same name is found, create the employee
        if row is None:
            nowDate = datetime.now()

            #create the restaurant
            conn = db_connect.connect()
            postQuery = '''INSERT INTO Employees (
                    UserID, 
                    RestaurantID, 
                    Permission, 
                    Status,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                ) VALUES (?,?,?,?,?,?,?,?,?)'''
            postValues = (aJSON["UserID"], 
                aJSON["RestaurantID"], 
                aJSON["Permission"], 
                "New", 1, nowDate, 1, nowDate, 1) 
            postResult = conn.execute(postQuery, postValues)
            conn.close
            empID = postResult.lastrowid
            print(empID)
            return jsonify(empID)
        
        # if there is a matching email found, then raise the error 
        else:
            return jsonify("False")

# PURPOSE - provide a resource for managing restaurant profiles
class Restaurant(Resource):

    # PURPOSE - provide a method to retrieve user information
    #  ARGS - <none>: returns all restaurants 
    #   ResID: returns single record based on resID 
    #   Name: returns single record based on Name 
    #  Returns - RestaurantID, Name, Address, Standard Record Details
    def get(self):
        print("Restaurants requested")
        conn = db_connect.connect() # connect to database
        if "resID" in request.args:
            sql = '''SELECT RestaurantID, 
                    Name, 
                    LocAddress, 
                    LocAddress2, 
                    LocCity,
                    LocRegion,
                    LocCountry,
                    LocCode,
                    Status,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Restaurants WHERE RestaurantID = ?'''
            query = conn.execute(sql, request.args["resID"]) # This line performs query and returns json result
        elif "name" in request.args:
            sql = '''SELECT RestaurantID, 
                    Name, 
                    LocAddress, 
                    LocAddress2, 
                    LocCity,
                    LocRegion,
                    LocCountry,
                    LocCode,
                    Status,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Restaurants WHERE Name = ?'''
            query = conn.execute(sql, request.args["name"]) # This line performs query and returns json result
        else:
            sql = '''SELECT RestaurantID, 
                    Name, 
                    LocAddress, 
                    LocAddress2, 
                    LocCity,
                    LocRegion,
                    LocCountry,
                    LocCode,
                    Status,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Restaurants'''
            query = conn.execute(sql) # This line performs query and returns json result

        result = {'Restaurants': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
        conn.close
        return jsonify(result)

    # PURPOSE - provide a method to post a new Restaurant
    #  ARGS - <none>
    #  Returns -    ID: Restaurant ID when created successfully; 
    #               FALSE: User not created
    def post(self):
        print("Post Restaurant requested")
        aJSON = request.get_json(force=True)

        # ++ validate name is unique
        conn = db_connect.connect()
        postResult = conn.execute('SELECT RestaurantID from Restaurants WHERE Name =?', aJSON["Name"]) # Search for other restuarants with this name
        row = postResult.fetchone()

        # if no record with the same name is found, create the restaurant
        if row is None:
            nowDate = datetime.now()

            #create the restaurant
            conn = db_connect.connect()
            postQuery = '''INSERT INTO Restaurants (
                    Name, 
                    LocAddress, 
                    LocAddress2, 
                    LocCity,
                    LocRegion,
                    LocCountry,
                    LocCode,
                    Status,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'''
            postValues = (aJSON["Name"], 
                aJSON["LocAddress"], 
                aJSON["LocAddress2"], 
                aJSON["LocCity"], 
                aJSON["LocRegion"], 
                aJSON["LocCountry"], 
                aJSON["LocCode"], 
                "New", 1, nowDate, 1, nowDate, 1) 
            postResult = conn.execute(postQuery, postValues)
            conn.close
            resID = postResult.lastrowid
            print(resID)
            return jsonify(resID)
        
        # if there is a matching email found, then raise the error 
        else:
            return jsonify("False")

    # PURPOSE - provide a method to update a user
    #  ARGS - Not Implemented
    #  Returns - "Not Implemented"
    def patch(self):
        print("Patch User Requested")
        aJSON = request.get_json(force=True)
        conn = db_connect.connect()
        lastLogin = datetime.now()

        
        sql = '''UPDATE Users 
            SET LastLogin = ?
            WHERE UserID = ?'''
        aValues = (lastLogin, 
            aJSON["UserID"]) 
        #print(aValues)
        conn.execute(sql, aValues) 
        conn.close
        return jsonify("Method Not Supported")

# PURPOSE - provide a resource for managing users
class User(Resource):

    try:
        print("Connecting to database")
        db_connect = create_engine('sqlite:///c:\\Projects\\SweetPickle\\DATA\\main.db')
        #db_connect = create_engine('sqlite:///c:\\Web Page\\JobReporting\\data\\reporting_test.db')
    except:
        print("Failed to connect to database")

    #  ARGS - <none>: returns all users, UserID: returns single user
    #  Returns - UserID, Name, Email, CreateDate, LastLogin
    def get(self):
        print("Users requested")
        conn = db_connect.connect() # connect to database
        if "userID" in request.args:
            sql = '''SELECT UserID, 
                    FullName, 
                    PrefName, 
                    Email, 
                    LastLogin,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Users WHERE UserID = ?'''
            query = conn.execute(sql, request.args["userID"]) # This line performs query and returns json result
        elif "email" in request.args:
            sql = '''SELECT UserID, 
                    FullName, 
                    PrefName, 
                    Email, 
                    LastLogin,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Users WHERE Email = ?'''
            query = conn.execute(sql, request.args["email"]) # This line performs query and returns json result
        else:
            sql = '''SELECT UserID, 
                    FullName, 
                    PrefName, 
                    Email, 
                    LastLogin,
                    Active,
                    CreateDate,
                    CreateUser,
                    ModDate,
                    ModUser 
                FROM Users'''
            query = conn.execute(sql) # This line performs query and returns json result

        result = {'Users': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
        conn.close
        return jsonify(result)

    # PURPOSE - provide a method to post a new user
    #  ARGS - <none>
    #  Returns - TRUE: User created successfully; FALSE: User not created
    def post(self):
        print("Post Users Requested")
        aJSON = request.get_json(force=True)

        # ++ validate email is unique
        conn = db_connect.connect()
        postResult = conn.execute('SELECT UserID from Users WHERE Email =?', aJSON["Email"]) # Search for other users with this email
        row = postResult.fetchone()

        # if no record with the same email is found, create the user
        if row is None:
            nowDate = datetime.now()
            passWord = aJSON["Password"] #change this to be encrypted

            #create the User
            conn = db_connect.connect()
            postQuery = '''INSERT INTO Users (
                FullName, 
                PrefName, 
                Email, 
                Password, 
                LastLogin, 
                Active, 
                CreateDate,
                CreateUser,
                ModDate,
                ModUser 
                ) VALUES (?,?,?,?,?,?,?,?,?,?)'''
            postValues = (aJSON["FullName"], aJSON["PrefName"], aJSON["Email"], passWord, nowDate, 1, nowDate, 1, nowDate, 1) 
            postResult = conn.execute(postQuery, postValues)
            conn.close
            userID = postResult.lastrowid
            return jsonify(userID)
        
        # if there is a matching email found, then raise the error 
        else:
            return jsonify("False")

    # PURPOSE - provide a method to update a user
    #  ARGS - Not Implemented
    #  Returns - "Not Implemented"
    def patch(self):
        print("Patch User Requested")
        aJSON = request.get_json(force=True)
        conn = db_connect.connect()
        lastLogin = datetime.now()
        
        sql = '''UPDATE Users 
            SET LastLogin = ?
            WHERE UserID = ?'''
        aValues = (lastLogin, 
            aJSON["UserID"]) 
        #print(aValues)
        conn.execute(sql, aValues) 
        conn.close
        return jsonify("Method Not Supported")

# PURPOSE - provide a resource for logging in users
class Login(Resource):

    try:
        print("Connecting to database")
        db_connect = create_engine('sqlite:///c:\\Projects\\SweetPickle\\DATA\\main.db')
        #db_connect = create_engine('sqlite:///c:\\Web Page\\JobReporting\\data\\reporting_test.db')
    except:
        print("Failed to connect to database")

    #  ARGS - <none>: Email, Password to verify user
    #  Processes - upon successful validation, sets last login to now
    #  Returns - UserID, PrefName
    def patch(self):
        print("Post Login Requested")
        aJSON = request.get_json(force=True)

        password = aJSON["password"] # <-- add decryption to this

        # ++ validate email and password combination
        conn = db_connect.connect()
        getResult = conn.execute('SELECT UserID, PrefName from Users WHERE Active = 1 AND Email = ? AND Password = ?', (aJSON["email"], password)) # Search for other users with this email
        row = getResult.fetchone()
        print(row)
        conn.close
        # if no record with the same email is found, send the error
        if row is None:
            return jsonify("False")
        else:
            #update the Users last login
            lastLogin = datetime.now()
            #lastLogin = "2020-04-03"
            print(lastLogin)
            conn = db_connect.connect()
            sql = '''UPDATE Users 
                SET LastLogin = ? 
                WHERE UserID = ?'''
            aValues = (lastLogin, row[0])
            conn.execute(sql, aValues) 
            conn.close
            result = {"UserID" : row[0], "PrefName": row[1]}
            #Send back the users details for use with the application
            #result = {'Users': [dict(zip(tuple (query.keys()) ,i)) for i in query.cursor]}
            return jsonify(result)
