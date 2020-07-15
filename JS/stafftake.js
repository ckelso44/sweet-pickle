//Used by the Staff Take form for creating and editing Staff Takes


//update the difference and status field after there has been an update to the number fields
function calcTake() {
    console.log("caclulate the take")
    var expected = document.getElementById("expected").value
    var actual = document.getElementById("actual").value
    if (expected == "" || actual == "") {
        document.getElementById("difference").value = ""
        document.getElementById("pStatus").checked = false
    } else {
        diff = Number(actual) - Number(expected)
        document.getElementById("difference").value = diff.toFixed(2)
        document.getElementById("pStatus").checked = true
    }
}

//update the take sheet for the payment method
function updateTake() {
    // patch a existing Take
    var resURL = gURL + '/dailytake/stafftake/take?resID=' + getResID();
    var status = 1
    if (document.getElementById("pStatus").checked == true) {
        status = 0
    }
    var empObj = {
        "TakeID": document.getElementById("tID").value,
        "Expected": document.getElementById("expected").value,
        "Actual": document.getElementById("actual").value,
        "Difference": document.getElementById("difference").value,
        "Status": status,
        "UserID": getUserID()
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('PATCH', resURL, true);
    request.onload = function() {
        // Begin accessing JSON data here

        var request = JSON.parse(this.response);
        console.log(request);
        if (request == "Success") {
            loadTakes(document.getElementById("stID").value);
        } else {
            var request = JSON.parse(this.response);
            console.log(request)
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

// request to create a new Staff Take and trigger the appropriate action depening upon the button pressed
function newStaffTake(action) {
    // post a new staffTake
    var JSONProfile = getCookie("spProfile");
    objProfile = JSON.parse(JSONProfile);

    var resURL = gURL + '/dailytake/stafftake?resID=' + objProfile.RestaurantID;

    var empObj = {
        "DailyTakeID": document.getElementById("dtID").value,
        "EmployeeID": document.getElementById("staff").value,
        "Shift": document.getElementById("shift").value,
        "UserID": objProfile.UserID
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('POST', resURL, true);
    request.onload = function() {
        // Begin accessing JSON data here

        var stID = JSON.parse(this.response);
        console.log(stID);
        if (action == "apply") {
            loadTakes(stID);
        } else {
            returnDailyTake()
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

// request to create a new Staff Take and trigger the appropriate action depening upon the button pressed
function updateStaffTake(action) {
    // patch a new staffTake
    var JSONProfile = getCookie("spProfile");
    objProfile = JSON.parse(JSONProfile);

    var resURL = gURL + '/dailytake/stafftake?resID=' + objProfile.RestaurantID;

    var empObj = {
        "StaffTakeID": document.getElementById("stID").value,
        "DailyTakeID": document.getElementById("dtID").value,
        "EmployeeID": document.getElementById("staff").value,
        "Shift": document.getElementById("shift").value,
        "UserID": objProfile.UserID
    };
    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();

    request.open('PATCH', resURL, true);
    request.onload = function() {
        // Begin accessing JSON data here

        var request = JSON.parse(this.response);
        console.log(request);
        if (request == "Success") {
            if (action == "apply") {
                loadTakes(document.getElementById("stID").value);
            } else {
                returnDailyTake()
            }
        } else {
            var request = JSON.parse(this.response);
            console.log(request)
        }
    }
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(empJSON);
}

// Edit Daily Take sheets for basic values
function editPayment(payObj) {
    //Open a modal window for editing the basic takes
    var modal = document.getElementById("myModal");

    // Prepare the message
    paymentText = payObj["Payment"]
    document.getElementById("mHeader").innerHTML = "Enter new values for " + paymentText.toUpperCase() + " payments"
    document.getElementById("tID").value = payObj["TakeID"]
    var expected = payObj["Expected"]
    if (expected != undefined && expected != "") {
        expected = Number(expected)
    }
    document.getElementById("expected").value = expected

    var actual = payObj["Actual"]
    if (actual != undefined && actual != "") {
        actual = Number(actual)
    }
    document.getElementById("actual").value = actual

    var diff = payObj["Difference"]
    console.log(diff)
    if (diff != undefined && diff != "") {
        diff = Number(diff)
    }
    document.getElementById("difference").value = diff

    var status = payObj["Status"]
    if (status == 0) {
        document.getElementById("pStatus").checked = true
    } else {
        document.getElementById("pStatus").checked = false
    }


    // Get the buttons for the modal
    var confirmBtn = document.getElementById("mButtonConfirm");
    var cancelBtn = document.getElementById("mButtonCancel");


    // open the modal 
    modal.style.display = "block";

    // When the user clicks on confirm, set the userID and close the modal
    confirmBtn.onclick = function() {
            modal.style.display = "none";
            updateTake()
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

//loads the take sheets for the staff shift
// inputs: stID to lookup associated take sheets
function loadTakes(stID) {
    // load the take sheets for the stID
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    var resURL = gURL + '/dailytake/stafftake?resID=' + getResID() + '&StaffTakeID=' + stID;
    console.log(resURL)
    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        stData = request.StaffTake[0];
        console.log(stData);
        document.getElementById("stTitle").innerHTML = "Take Entry for " + stData["Date"]
        document.getElementById("staff").value = stData["EmployeeID"]
        document.getElementById("shift").value = stData["Shift"]
        document.getElementById("stID").value = stID
        document.getElementById("dtID").value = stData["DailyTakeID"]
        let stStatus = document.getElementById("status")
            /* set status - 
             - if takes are not defined, then Warning - Takes missing
             - if status is 0 then Complete
             - if the status != 0 and take's date is greater then today, then status = Ready
             - else status is Incomplete
             */
        tData = stData["Takes"]
        if (tData.length == 0) {
            stStatus.innerHTML = "Warning - Takes Missing"
            return;
        } else if (stData["Status"] == "0") {
            stStatus.innerHTML = "All payments have been entered"
                // use elseif to call function dateOffset to compare date and set to ready 
        } else {
            stStatus.innerHTML = "Some payments have not been entered"
            document.getElementById("stDiv").style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--Alert');
        }

        // Load the takes
        var table = document.createElement("table"); // Create a table element
        table.className = "sumTable"
        var header = table.createTHead("header");
        var tr = header.insertRow(-1);
        var headerList = ["Payment", "Expected", "Actual", "Difference", "Status"]

        // Figure out how to get the header in there        var theader = document.createElement() 
        for (var j = 0; j < headerList.length; j++) {

            // Create the table header the element
            var rheader = document.createElement("th");
            rheader.innerHTML = headerList[j];

            // Append columnName to the table row 
            tr.appendChild(rheader);
        }
        var body = table.createTBody("body");

        // console.log(takes)
        for (var j = 0; j < tData.length; j++) { // for each of the take sheets
            var tr = body.insertRow(-1);
            tr.className = "editRow"
                //var createClickHandler = function(row, appId) {
            var createClickHandler = function(row, take) {
                return function() {
                    var cell = row.getElementsByTagName("td")[0];
                    editPayment(take)
                        // console.log(appId)
                        // location.replace("application.html?appID=" + appId);
                };
            }

            //var id = appData[i].ApplicationID;
            //tr.onclick = createClickHandler(tr, id);
            var take = tData[j];
            //console.log(take)
            tr.onclick = createClickHandler(tr, take);
            //fill in the cells for the take values
            for (var k = 0; k < headerList.length; k++) {
                var cell = tr.insertCell(-1);
                var tValue = take[headerList[k]];
                if (k == 0) {
                    cell.className = "sumRow";
                    cell.innerHTML = tValue
                } else if (k == 4) { // if this is the status column, set a check or x
                    cell.className = "noSum";
                    if (tValue == 0) {
                        cell.innerHTML = "&#10004"
                    } else { cell.innerHTML = "&#63" }
                } else {
                    if (tValue === undefined || tValue === "" || tValue === null) {
                        cell.className = "noSum";
                        cell.innerHTML = tValue
                        console.log(tValue)
                    } else {
                        cell.className = "sumValue";
                        cell.innerHTML = Number(tValue).toFixed(2);
                    }
                    //sumStaffTakeCell = Number(document.getElementById(sumIDs[k]).innerHTML) + Number(take[headerList[k]])
                    //document.getElementById(sumIDs[k]).innerHTML = sumStaffTakeCell;
                }
            }
        }
        //update the status of the staff take
        //curStatus = document.getElementById(statusID).innerHTML;
        //document.getElementById(statusID).innerHTML = Number(curStatus) + Number(take["Status"]);

        //add the table to the detail tab
        document.getElementById("takesheets").innerHTML = ""
        document.getElementById("takesheets").appendChild(table);

    }

    // send the request
    request.send()
}

//show the other field when shift selected as 'other'
function viewOther() {
    var shift = document.getElementById("shift").value
    if (shift == "Other") {
        document.getElementById("otherShift").hidden = false
    } else {
        document.getElementById("otherShift").hidden = true
    }
}

// load the shift preferences
function loadShifts() {
    // call tookit function for the system preference
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    var resURL = gURL + '/system?resID=' + getResID() + '&key=Shifts';


    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        sData = request.System;
        shifts = JSON.parse(sData[0].Value)
            // console.log(shifts)
        for (var i = 0; i < shifts.length; i++) {
            // <option value="10001">Lucy May</option>
            var shift = shifts[i]
            empOption = document.createElement("OPTION")
            empOption.value = shift
            empOption.label = shift
            document.getElementById("shift").appendChild(empOption)
        }
        empOption = document.createElement("OPTION")
        empOption.value = "Other"
        empOption.label = "Other"
        document.getElementById("shift").appendChild(empOption)
    }

    // send the request
    request.send()
}

// load staff list for the choice list
function loadStaff(resID) {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.

    var resURL = gURL + '/employees/active?resID=' + resID;
    console.log(resURL);

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        empData = request.Employees;

        //console.log(empData);
        for (var i = 0; i < empData.length; i++) {
            // <option value="10001">Lucy May</option>
            var employee = empData[i]
            empOption = document.createElement("OPTION")
            empOption.value = employee["EmployeeID"]
            empOption.label = employee["FullName"]
            document.getElementById("staff").appendChild(empOption)
        }
    }

    // send the request
    request.send()
}

// apply the staff take form
function applyStaffTake() {
    // create the new the staff record
    var stID = document.getElementById("stID").value
    console.log(stID)
    if (stID == "") {
        newStaffTake("apply")
    } else {
        updateStaffTake("apply")
    }
}

// save the staff take form
function saveStaffTake() {
    //save the changes to the staff form
    if (document.getElementById("stID").value == "") {
        newStaffTake("save")
    } else {
        updateStaffTake("save")
    }
}

// cancel the staff take form
function returnDailyTake() {
    //go back to the previous page without saving changes
    window.location.replace("take.html?dtID=" + document.getElementById("dtID").value)
}

// delete the staff take form
function deleteStaffTake() {
    //request to delete the staff take form
}

// prepare the form when it loads
function stOnLoad() {
    // initialize the page and validate the user
    setMenu()


    // check for a ID's on the requestor URL
    resID = getResID()
    loadStaff(resID);
    loadShifts(resID);

    var pageParams = getParams(window.location.href)
    if ("stID" in pageParams) {
        console.log("This is for an existing staff take")
        stID = pageParams["stID"]
        document.getElementById("stID").value = stID
        document.getElementById("btnApply")
        loadTakes(stID)

    } else if ("dtID" in pageParams) {
        console.log("we're going to create a new stafftake")
        document.getElementById("dtID").value = pageParams["dtID"]
        document.getElementById("takePage").href = "take.html?dtID=" + pageParams["dtID"]
    } else {
        console.log("something went wrong")
    }
}