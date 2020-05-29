// PURPOSE - Triggering Provisioning Scripts for creating new restaurants
//  global variables

//FUNCTION - updateStatus()
// Update the sumDetails Page as the provisioning creates the profiles
// Inputs - message: test to add to display
// Outputs - none
function updateStatus(message, fieldID) {
    curMessage = document.getElementById(fieldID).innerHTML;
    newMessage = curMessage + "<br>" + message;
    document.getElementById(fieldID).innerHTML = newMessage;
    return;
}

// Create a new user that can be used to associate to the restaurant
// Inputs - None
// Outputs - None
function createUser() {
    var empObj = {
        "FullName": document.getElementById("fName").value,
        "PrefName": document.getElementById("pName").value,
        "Email": document.getElementById("email").value,
        "Password": document.getElementById("password").value
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', gURL + '/user', true);
    request.onload = function() {

        var dataRes = JSON.parse(this.response);
        console.log("Result of User Post: " + dataRes)
        if (dataRes == "False") {
            alert("Failed to create user!")
        } else {
            document.getElementById("userID").value = dataRes
            message = "User created: " + dataRes
            updateStatus(message, "sumDetails")
            message = "Creating Restaurant..."
            updateStatus(message, "sumDetails")
            provisionRestaurant();
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);

}

//FUNCTION - confirmUser()
// Prompt the user to accept the user that was found or cancel
// Inputs - userProfile: details for the user that was matched
// Outputs - Success: Profile of the User, Fail: 0
function confirmUser(userProfile) {

    // Get the modal
    var modal = document.getElementById("myModal");

    // Prepare the message
    document.getElementById("mHeader").innerHTML = "Confirm User"
    var message = "Please confirm you would like to use the following user or select Cancel to change details...";
    var details = "Full Name: " + userProfile["FullName"] + "<br>";
    details = details + "Preferred Name: " + userProfile["PrefName"] + "<br>";
    details = details + "Email: " + userProfile["Email"];

    document.getElementById("mBody").innerHTML = message;
    document.getElementById("mDetails").innerHTML = details;

    // Get the buttons for the modal
    var confirmBtn = document.getElementById("mButtonConfirm");
    var cancelBtn = document.getElementById("mButtonCancel");


    // open the modal 
    modal.style.display = "block";

    // When the user clicks on confirm, set the userID and close the modal
    confirmBtn.onclick = function() {
        user = userProfile["UserID"];
        document.getElementById("userID").value = user;
        var message = "The following User will be used: " + user;
        updateStatus(message, "sumDetails");
        message = "Provisioning restaurant...";
        updateStatus(message, "sumDetails");
        modal.style.display = "none";
        provisionRestaurant();
    }

    // When the user clicks on the cancel button, set the userID and close the modal
    cancelBtn.onclick = function() {
        modal.style.display = "none";
    }


    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

//FUNCTION - userMatch()
// Check if the user already exists in the system
// Inputs - email: email of the user to check
// Outputs - Success: Profile of the User, Fail: 0
function userMatch(email) {

    // send a request to lookup the user by their email
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/user?email=' + email;
    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var dataRes = JSON.parse(this.response);
        userData = dataRes.Users;
        // check if there are any records, send back profile or 0 if no records found
        if (userData.length == 0) {
            document.getElementById("userID").value = 0;
            createUser();
        } else {
            confirmUser(userData[0]);
        }
        console.log(userData);
    }

    // Send request

    request.send()
}

//  Start the action to generate the User, Restaurant, and Employee Profiles
//  INPUTS - None
//  OUTPUTS - None
function provisionUser() {
    console.log("Provision Started...");

    //validate fields to ensure that all data has been entered correctly
    userEmail = document.getElementById("email").value;
    if (userEmail == "") {
        alert("Email is required")
        return;
    }
    resName = document.getElementById("rName").value;
    if (resName == "") {
        alert("Restaurant Name is required")
        return;
    }
    // start the provisioning process by checking for an existing user by that email
    message = "All fields are valid, beginning provisioning process with User..."
    updateStatus(message, "sumDetails")
    userMatch(userEmail);
}

// Create a new restaurant that can be used to associated to the employee
// Inputs - None
// Outputs - None
function createRestaurant() {
    var empObj = {
        "Name": document.getElementById("rName").value,
        "LocAddress": document.getElementById("address").value,
        "LocAddress2": document.getElementById("address2").value,
        "LocCity": document.getElementById("city").value,
        "LocRegion": document.getElementById("region").value,
        "LocCountry": document.getElementById("country").value,
        "LocCode": document.getElementById("code").value
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', gURL + '/restaurant', true);
    request.onload = function() {

        var dataRes = JSON.parse(this.response);
        console.log("Result of res Post: " + dataRes)
        if (dataRes == "False") {
            alert("Failed to create restuarant!")
        } else {
            document.getElementById("resID").value = dataRes
            message = "Restaurant created: " + dataRes
            updateStatus(message, "sumDetails")
            message = "Creating Employee..."
            updateStatus(message, "sumDetails")
            provisionEmployee();
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);

}

// Prompt the user to accept the restaurant that was found or cancel
// Inputs - userProfile: details for the user that was matched
// Outputs - Success: Profile of the User, Fail: 0
function confirmRes(resProfile) {

    // Get the modal
    var modal = document.getElementById("myModal");

    // Prepare the message
    document.getElementById("mHeader").innerHTML = "Confirm Restaurant"
    var message = "Please confirm you would like to use the following restaurant or select Cancel to change details...";
    var details = "Name: " + resProfile["Name"] + "<br>";
    details = details + "Address: " + resProfile["LocAddress"] + "<br>";
    details = details + "City: " + resProfile["LocCity"] + "<br>";
    details = details + "Country: " + resProfile["LocCountry"];

    document.getElementById("mBody").innerHTML = message;
    document.getElementById("mDetails").innerHTML = details;

    // Get the buttons for the modal
    var confirmBtn = document.getElementById("mButtonConfirm");
    var cancelBtn = document.getElementById("mButtonCancel");


    // open the modal 
    modal.style.display = "block";

    // When the user clicks on confirm, set the resID and close the modal
    confirmBtn.onclick = function() {
        var res = resProfile["RestaurantID"];
        document.getElementById("resID").value = res;
        var message = "The following restaurant will be used: " + res;
        updateStatus(message, "sumDetails");
        message = "Provisioning employee...";
        updateStatus(message, "sumDetails");
        modal.style.display = "none";
        provisionEmployee();
    }

    // When the user clicks on the cancel button, set the userID and close the modal
    cancelBtn.onclick = function() {
        modal.style.display = "none";
    }


    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

//FUNCTION - resMatch()
// Check if the restaurant already exists in the system
// Inputs - Name: restaurant name to check
// Outputs - Success: Profile of the User, Fail: 0
function resMatch(name) {

    // send a request to lookup the restaurant by their name
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/restaurant?name=' + name;

    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var dataRes = JSON.parse(this.response);
        resData = dataRes.Restaurants;

        // check if there are any records, send back profile or 0 if no records found
        if (resData.length == 0) {
            document.getElementById("resID").value = 0;
            createRestaurant();
        } else {
            confirmRes(resData[0]);
        }
    }

    // Send request
    request.send()
}

//  Start the action to generate the Restaurant after confirming the UserID 
//  INPUTS - None
//  OUTPUTS - None
function provisionRestaurant() {
    console.log("Restaurant Provision Started...");

    //Check to see if there is an existing Restaurant with that name
    resName = document.getElementById("rName").value;
    resMatch(resName);
}

// Create a new employee that can be used to associate the user to the restaurant
// Inputs - None
// Outputs - None
function createEmployee() {
    var empObj = {
        "UserID": document.getElementById("userID").value,
        "RestaurantID": document.getElementById("resID").value,
        "Permission": 1
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', gURL + '/employee', true);
    request.onload = function() {

        var dataRes = JSON.parse(this.response);
        console.log("Result of employee Post: " + dataRes)
        if (dataRes == "False") {
            alert("Failed to create employee!")
        } else {
            message = "Employee created: " + dataRes
            updateStatus(message, "sumDetails")
            message = "Process complete!"
            updateStatus(message, "sumDetails")
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);

}

// Check if the employee already exists in the system
// Inputs -     userID: user ID to check for match, 
//              resID: restaurantID to check for match
// Outputs -    Success: Employee ID of the User, Fail: 0
function empMatch(user, res) {

    // send a request to lookup the employee by their user and restaurant IDs
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/employee?UserID=' + user + '&RestaurantID=' + res;

    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var dataRes = JSON.parse(this.response);
        empData = dataRes.Employees;

        // check if there are any records, send back profile or 0 if no records found
        if (empData.length == 0) {
            createEmployee();
        } else {
            var message = "An employee already exists for this restaurant, have the admin for the restaurant re-active their profile if necessary."
            updateStatus(message, "sumDetails");
        }
        console.log(resData);
    }

    // Send request
    request.send()
}

//  Completes the action to create the Employee  
//  INPUTS - None
//  OUTPUTS - None
function provisionEmployee() {
    console.log("Employee Provision Started...");

    userID = document.getElementById("userID").value
    resID = document.getElementById("resID").value;
    empMatch(userID, resID);
}