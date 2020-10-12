// -------------------- Functions to create a new user -----------------------------------------

// Create a new employee that can be used to associate the user to the restaurant
// Inputs - None
// Outputs - None
/*function createEmployee() {
    var empObj = {
        "UserID": document.getElementById("userID").value,
        "RestaurantID": document.getElementById("restaurants").value,
        "FullName": document.getElementById('fName').value
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
            document.getElementById("sumDetails").innerHTML = message
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
} */

// Create a new user that can be used to associate to the restaurant
// Inputs - None
// Outputs - None
/* function createUser() {
    var empObj = {
        "FullName": document.getElementById("fName").value,
        "UserName": document.getElementById("uName").value,
        "Email": document.getElementById("email").value,
        "Password": document.getElementById("password").value
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', gURL + '/user', true);
    request.onload = function() {

        var dataUser = JSON.parse(this.response);
        console.log("Result of User Post: " + dataUser)
        if (dataUser == "False") {
            alert("Failed to create user!")
        } else {
            document.getElementById("userID").value = dataUser
            message = "User created: " + dataUser
            document.getElementById("sumDetails").innerHTML = message
            createEmployee();
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);

} */


//FUNCTION - userMatch()
// Check if the user already exists in the system
// Inputs - email: email of the user to check
// Outputs - Success: Profile of the User, Fail: 0
/* function userMatch(email) {

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
                document.getElementById("sumDetails").innerHTML = "A user already exists with that name, search for their record and add them to a new restaurant if required.";
            }
            console.log(userData);
        }
        // Send request
    request.send()
} */

// ---------------------------- Staff Page -----------------------------------------

/** Launch page to create a new staff member */
function newStaff() {
    location.replace("staffmember.html")
}

/**
 * Loads the staff list to review
 */
function loadStaffList() {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    resID = getResID()
    var resURL = gURL + '/staff?resID=' + resID;

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        staffData = request.Staff;

        var cols = [];
        for (var i = 0; i < staffData.length; i++) {
            for (var k in staffData[i]) {
                if (cols.indexOf(k) === -1) {
                    cols.push(k); // Push all keys to the array 
                }
            }
        }
        // console.log(appData);
        // console.log(appData[1].ApplicationID);

        var table = document.createElement("table"); // Create a table element 
        var tr = table.insertRow(-1);
        var headerList = ["Staff ID", "Login ID", "Full Name", "Preferred Name", "Status", "Active", "Create Date", "Last Updated"]
        var dataList = ["StaffID", "UserID", "FullName", "PrefName", "Status", "Active", "CreateDate", "ModDate"]

        for (var i = 0; i < headerList.length; i++) {

            // Create the table header the element 
            var theader = document.createElement("th");
            theader.innerHTML = headerList[i];

            // Append columnName to the table row 
            tr.appendChild(theader);
        }

        // Adding the data to the table 
        for (var i = 0; i < staffData.length; i++) {
            // Create a new row 
            trow = table.insertRow(-1);
            // Add onclick handler to the row
            var createClickHandler = function(row, staffID) {
                return function() {
                    var cell = row.getElementsByTagName("td")[0];
                    // console.log(appId)
                    location.replace("staffmember.html?StaffID=" + staffID);
                };
            }

            var id = staffData[i].StaffID;
            trow.onclick = createClickHandler(trow, id);

            for (var j = 0; j < dataList.length; j++) {
                var cell = trow.insertCell(-1);

                // Inserting the cell at particular place 
                cell.innerHTML = staffData[i][dataList[j]];
            }
        }
        // Add the newely created table containing json data 
        var el = document.getElementById("staffTable");
        el.innerHTML = "";
        el.appendChild(table);
    }

    // Send request
    request.send()
}

function staffOnLoad() {
    setMenu("Staff", "Admin")
    loadStaffList()
}

// ------------------ Functions for Staff Member Page ------------------------------------

/** Enable email and disable user name */
function clickEmail() {
    document.getElementById("userEmail").disabled = false
    var userField = document.getElementById("userName")
    userField.disabled = true
    userField.value = null
}

/** Enable user name and disable email */
function clickUser() {
    document.getElementById("userName").disabled = false
    var userField = document.getElementById("userEmail")
    userField.disabled = true
    userField.value = null

}

/** test to make sure that the post works */
function testPost() {
    var resURL = gURL + '/staff?resID=' + getResID();

    var empObj = {
        "FullName": "John Smith",
        "PrefName": "Johnny",
        "Status": "New",
        "Active": true,
        "Login": true,
        "Email": "test27@example.com",
        "UserName": "",
        "Password": "twoducks",
        "ModUser": getUserID()
    };
    console.log(empObj);
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', resURL, true);

    request.onload = function() {
        // Begin accessing JSON data here
        var staffData = JSON.parse(this.response);
        // check the status of the request
        console.log(staffData)

        var updateMsg = function() {
            var modal = document.getElementById("msgModal");
            modal.style.display = "none";
        }
        var msg = "Post was successful"
        showMessage(msg, true, updateMsg)
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

/** Show a message 
 * @param userCreate true if user login details have been supplied
 */
function postStaff(userCreate) {
    var resURL = gURL + '/staff?resID=' + getResID();

    var empObj = {
        "FullName": document.getElementById("name").value,
        "PrefName": document.getElementById("pName").value,
        "Status": document.getElementById("status").value,
        "Active": document.getElementById("active").checked,
        "Login": userCreate,
        "Email": document.getElementById("userEmail").value,
        "UserName": document.getElementById("userName").value,
        "Password": document.getElementById("userPassword").value,
        "ModUser": getUserID()
    };
    console.log(empObj);
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', resURL, true);

    request.onload = function() {
        // Begin accessing JSON data here
        var staffData = JSON.parse(this.response);
        // check the status of the request
        console.log(staffData)
        if (staffData["status"] == "Success") {
            newURL = window.location.href + "?StaffID=" + staffData["value"]
            var loadWithStaff = function() {
                location.replace(newURL)
            }
            showMessage(staffData['message'], true, loadWithStaff)
        } else {
            var returnToPage = function() {
                var modal = document.getElementById("msgModal");
                modal.style.display = "none"
            }
            showMessage(staffData["message"], true, returnToPage)
        }
    }


    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

/** Show a message 
 * @param msg String to display in the message
 * @param status false if the message is to wait or true if the user needs to select OK to continue
 * @param action "If the user needs to continue include a function to trigger on selection of OK"
 */
function showMessage(msg, status, action) {

    //Open a modal window for editing the basic takes
    var modal = document.getElementById("msgModal");
    document.getElementById("statusMsg").innerHTML = msg

    // open the modal 
    modal.style.display = "block";

    if (status == true) {
        document.getElementById("mFooterDiv").hidden = false;
        var OKBtn = document.getElementById("OKBtn");

        // When the user clicks on new, prompt with the new login
        OKBtn.onclick = action

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = action
    }
}

/** Prompt to get login details */
function newLogin() {

    //Open a modal window for editing the basic takes
    var modal = document.getElementById("createUserModal");
    document.getElementById("ntHeader").innerHTML = "Add details for a new user"

    // Get the buttons for the modal
    var createBtn = document.getElementById("createLoginBtn");
    var cancelBtn = document.getElementById("cancelLoginBtn");

    // open the modal 
    modal.style.display = "block";

    // When the user clicks on new, prompt with the new login
    createBtn.onclick = function() {
        //show to get the login details
        modal.style.display = "none";
        showMessage("Creating new staff Member")
        postStaff(true);
    }

    // When the user clicks on the cancel button close the modal
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

/** Prompt to ask if a login should be created  */
function getLogin() {

    //Open a modal window for editing the basic takes
    var modal = document.getElementById("newLoginModal");
    document.getElementById("ntHeader").innerHTML = "Create a Login for " + document.getElementById("pName").value + "?"

    // Get the buttons for the modal
    var yesBtn = document.getElementById("mYesBtn");
    var noBtn = document.getElementById("mNoBtn");
    var cancelBtn = document.getElementById("mLoginCancelBtn");

    // open the modal 
    modal.style.display = "block";

    // When the user clicks on new, prompt with the new login
    yesBtn.onclick = function() {
        //create a new daily take
        modal.style.display = "none";
        newLogin()
    }

    // if the user clicks no, continue to create just the staff member
    noBtn.onclick = function() {
        //display list of previous takes
        modal.style.display = "none";
        showMessage("Creating new staff Member")
        postStaff(false);
    }

    // When the user clicks on the cancel button close the modal
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


// ------------------ Functions for Staff Member Page ------------------------------------

/**
 * Send the request to update the Staff Member
 */
function patchStaffMember(staffID) {

    var resURL = gURL + '/staff?resID=' + getResID();

    var empObj = {
        "StaffID": staffID,
        "UserID": document.getElementById("userID").value,
        "FullName": document.getElementById("name").value,
        "PrefName": document.getElementById("pName").value,
        "Status": document.getElementById("status").value,
        "Active": document.getElementById("active").checked,
        "ModUser": getUserID()
    };

    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('PATCH', resURL, true);
    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        if (request == "Success") {
            location.reload(true);
        } else {
            console.log(request);
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

/**
 * triggered on save request to determine if record exists and save appropriately
 */
function saveRes() {
    var pageParams = getParams(window.location.href)

    if ("StaffID" in pageParams) {
        patchStaffMember(pageParams["StaffID"]);
    } else {
        getLogin()
    }
}

/**
 * cancel the changes and reload the form with original details
 */
function cancelRes() {
    window.history.back();
}

/**
 * enable the save buttons when a field is updated 
 */
function enableSave() {

    let save = document.getElementById("saveBtn")
    save.disabled = false;
    save.className = "activeButton"

    let cancel = document.getElementById("cancelBtn")
    cancel.disabled = false;
    cancel.className = "activeButton"
}

/**
 * Load the staff member into the form
 * @param  {string} staffID Staff ID to lookup
 */
function loadStaffMember(staffID) {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.

    var staffURL = gURL + '/staff?resID=' + getResID() + '&staffID=' + staffID;

    request.open('GET', staffURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);

        // check if no records were returned, if so, trigger to create a new Daily Task
        sData = request.Staff[0]
        console.log(sData)
        document.getElementById("name").value = sData["FullName"]
        document.getElementById("userID").value = sData["UserID"]
        document.getElementById("pName").value = sData["PrefName"]
        document.getElementById("status").value = sData["Status"]
        document.getElementById('active').checked = sData["Active"]
    }

    // send the request
    request.send()
}

/** Initialize the page for a staff member or new staff member */
function staffMemberOnLoad() {
    setMenu("Staff", "Admin")
    var pageParams = getParams(window.location.href)

    if ("StaffID" in pageParams) {
        loadStaffMember(pageParams["StaffID"])
    } else {
        document.getElementById("edits").style.display = "none"
    }
}