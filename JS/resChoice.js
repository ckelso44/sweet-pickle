// Used primarily for the resChoice form that allows the user at login to select which restaurant they want to interact with

// Looks up the employee records to allow the user to login to a specific restaurant
// Triggers -   from OnLoad
// Inputs -     UserID: used to look up employee info 
// Outputs -    <None>
function resLogin(resID, resName) {
    //update the cookie with the restaurant ID & Name
    var JSONProfile = getCookie("spProfile");
    objProfile = JSON.parse(JSONProfile);
    objProfile.RestaurantID = resID;
    objProfile.RestaurantName = resName;
    setCookie("spProfile", JSON.stringify(objProfile), 100)

    //send them through to the main website
    location.replace("main.html")
}


// Looks up the employee records to allow the user to login to a specific restaurant
// Triggers -   from OnLoad
// Inputs -     UserID: used to look up employee info 
// Outputs -    <None>
function getEmployeeRecord(UserID, Name) {

    // request for all employee profiles with that user ID
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/employee?UserID=' + UserID + '&Active=True';

    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var dataRes = JSON.parse(this.response);
        empData = dataRes.Employees;

        if (empData.length > 1) {
            // IF more than one profile, force them to select one
            document.getElementById("message").innerHTML = "Please choose which resturant to login to..."

            // Show the restaurants as a button then can select
            for (var i = 0; i < empData.length; i++) {
                var restaurant = empData[i];
                resID = restaurant["RestaurantID"]
                resName = restaurant['Name']

                // create the wrapper Div and add it to the document
                var resDivID = "resDiv" + i
                var resDiv = document.createElement("DIV"); // Create a div element
                resDiv.className = "resChoiceDiv"
                resDiv.id = resDivID
                document.getElementById("message").appendChild(resDiv);

                // convert the div into a button displaying the Restaurant name
                var buttonID = "resButton" + i
                var resButton = document.createElement("BUTTON");
                resButton.className = "resButton";
                resButton.id = buttonID;
                resButton.innerHTML = resName;

                resButton.setAttribute('onclick', 'resLogin(' + resID + ', ' + resName + ')');
                document.getElementById(resDivID).appendChild(resButton);
            }

        } else if (empData.length == 1) {
            // IF only one, log them through directly after updating the cookie with the profile
            resID = empData[0].RestaurantID;
            resName = empData[0].Name;
            document.getElementById("message").innerHTML = "We found a restaurant! We're going to log you into Restaurant ID: " + resID;
            resLogin(resID, resName);
        } else {
            // IF no profile or error, message the user to go back to their admin, offer to return them back to the login
            document.getElementById("message").innerHTML = "Sorry but we couldn't find a record for you. Please go back to the login and try again with a different user or contact your restuarant administrator."
        }
    }

    // Send request
    request.send()
}

// Check if the employee already exists in the system
// Triggers -   Body onload of main.html
// Inputs -     <None> 
// Outputs -    <None>
function resChoiceOnLoad() {

    var JSONProfile = getCookie("spProfile")
    console.log(JSONProfile)
    objProfile = JSON.parse(JSONProfile)

    var activeUserID = objProfile["UserID"]
    if (activeUserID == "") {
        location.replace("login.html")
    }

    console.log(activeUserID)

    getEmployeeRecord(activeUserID);
}