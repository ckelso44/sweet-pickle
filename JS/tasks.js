// -- Toolkit functions

// Designed to allow the staff takes to expand
function takeExpand() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}


// -- Main page functions --

function patchDailyTake() {

    var JSONProfile = getCookie("spProfile");
    objProfile = JSON.parse(JSONProfile);

    var resURL = gURL + '/dailytake?resID=' + objProfile.RestaurantID;

    var empObj = {
        "DailyTakeID": document.getElementById("dtID").value,
        "GST": document.getElementById("GSTEdit").value,
        "PST": document.getElementById("PSTEdit").value,
        "Budget": document.getElementById("budgetEdit").value,
        "UserID": objProfile.UserID,
        "Net": document.getElementById("netTotal").innerHTML,
        "ResID": objProfile.RestaurantID
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

// Edit Daily Take sheets for basic values
function editDailyTake() {
    //Open a modal window for editing the basic takes
    var modal = document.getElementById("myModal");

    // Prepare the message
    document.getElementById("mHeader").innerHTML = "Please adjust the details for this days Take sheet"

    document.getElementById("GSTEdit").value = Number(document.getElementById("GST").innerHTML)
    document.getElementById("PSTEdit").value = Number(document.getElementById("PST").innerHTML)
    document.getElementById("budgetEdit").value = Number(document.getElementById("budget").innerHTML)


    // Get the buttons for the modal
    var confirmBtn = document.getElementById("mButtonConfirm");
    var cancelBtn = document.getElementById("mButtonCancel");


    // open the modal 
    modal.style.display = "block";

    // When the user clicks on confirm, set the userID and close the modal
    confirmBtn.onclick = function() {
        patchDailyTake();
        modal.style.display = "none";

        /*        user = userProfile["UserID"];
                document.getElementById("userID").value = user;
                var message = "The following User will be used: " + user;
                updateStatus(message, "sumDetails");
                message = "Provisioning restaurant...";
                updateStatus(message, "sumDetails");
                modal.style.display = "none";
                provisionRestaurant();
                */
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

// -- inital load for the daily take summary and saff take sheets
function loadTakeSheets() {
    //request data for the daily take
    // var today = nowDateUTC() // - note before using this, the date needs to be adjusted for local time
    today = '2020-05-03'
    console.log(today);

    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
        //check URL, if no parameter then assume today
        //resID = getResID() - broken
    var resID = '1000001'
    var resURL = gURL + '/dailytake?resID=' + resID + '&Date=' + today;
    console.log(resURL);

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);
        dtData = request.DailyTake[0];
        console.log(dtData);

        //Load the SumDetails into a table, adding the Expected and Actual totals
        var sumExpected = 0
        var sumActual = 0
        var sumDiff = 0

        var sumTable = document.createElement("table"); // Create a table element
        sumTable.className = "sumTable";

        //create the header
        var header = sumTable.createTHead("header");
        var tr = header.insertRow(-1);
        var headerList = ["Payment", "Expected", "Actual", "Difference"]
        var refList = ["Payment", "ExpSum", "ActSum", "DiffSum"]

        // Figure out how to get the header in there  
        for (var j = 0; j < headerList.length; j++) {

            // Create the table header the element
            var rheader = document.createElement("th");
            rheader.innerHTML = headerList[j];

            // Append columnName to the table row 
            tr.appendChild(rheader);
        }

        var body = sumTable.createTBody("body");
        var sumTakes = dtData.SumTakes;
        // console.log(takes)
        for (var j = 0; j < sumTakes.length; j++) { // for each of the take sheets
            var tr = body.insertRow(-1);
            var take = sumTakes[j];

            //fill in the cells for the take values and update the appropriate sum field
            for (var k = 0; k < refList.length; k++) {
                var cell = tr.insertCell(-1);
                var cellVal = take[refList[k]]
                if (k == 0) {
                    cell.className = "sumRow"
                    cell.innerHTML = cellVal
                } else if (k == 1) {
                    cell.className = "sumValue"
                    sumExpected = sumExpected + Number(cellVal)
                    cell.innerHTML = cellVal.toFixed(2)
                } else if (k == 2) {
                    cell.className = "sumValue"
                    sumActual = sumActual + Number(cellVal)
                    cell.innerHTML = cellVal.toFixed(2)
                } else {
                    cell.className = "sumValue"
                    sumDiff = sumDiff + Number(cellVal)
                    cell.innerHTML = cellVal.toFixed(2)
                }
            }
        }
        // add the last row of sum values
        var tr = body.insertRow(-1);
        for (var k = 0; k < refList.length; k++) {
            var cell = tr.insertCell(-1);
            if (k == 0) {
                cell.innerHTML = "Payment Sums"
                cell.className = "sumRow";
                cell.id = "PurchaseSumLabel"
            } else if (k == 1) {
                cell.innerHTML = sumExpected.toFixed(2)
                cell.className = "sumValueTotal";
                cell.id = "ExpSumTable"
            } else if (k == 2) {
                cell.innerHTML = sumActual.toFixed(2)
                cell.className = "sumValueTotal";
                cell.id = "ActSumTable"
            } else {
                cell.innerHTML = sumDiff.toFixed(2)
                cell.className = "sumValueTotal";
                cell.id = "DiffSumTable"
            }
        }

        //add the table to the detail tab
        document.getElementById("dailyTakeSummary").appendChild(sumTable);

        //load the Daily Take values
        document.getElementById("dtID").value = dtData["DailyTakeID"]
        document.getElementById("dayOfWeek").innerHTML = dtData["Date"];
        document.getElementById("GST").innerHTML = dtData["GST"];
        document.getElementById("PST").innerHTML = dtData["PST"];
        document.getElementById("budget").innerHTML = dtData["Budget"];
        dailyNet = sumActual - Number(dtData["GST"]) - Number(dtData["PST"])
        document.getElementById("netTotal").innerHTML = dailyNet.toFixed(2)
        dailyBudget = dailyNet - dtData["Budget"]
        document.getElementById("sumBudget").innerHTML = dailyBudget.toFixed(2)

        // -- load all the Staff Take data --
        var takeData = dtData["StaffTakes"];

        // prime the status bar by setting the complete count and setting the max var completeCount = 0; 
        document.getElementById("takeProgress").max = takeData.length

        for (var i = 0; i < takeData.length; i++) {
            var takeSheet = takeData[i];

            // create the wrapper Div and add it to the document
            var takeDivID = "takeDiv" + i
            var takeDiv = document.createElement("DIV"); // Create a div element
            takeDiv.className = "takeSheetDiv"
            takeDiv.id = takeDivID
            document.getElementById("takeSheetSpan").appendChild(takeDiv);

            // convert the div into a button - <button type="button" class="collapsible">
            var buttonID = "takeButton" + i
            var takeButton = document.createElement("BUTTON");
            takeButton.className = "collapsible"
            takeButton.id = buttonID
            document.getElementById(takeDivID).appendChild(takeButton);

            // add the manager details <span class="buttonText">Jerri: Day Sheet </span>
            var takeSpanMgr = document.createElement("SPAN");
            takeSpanMgr.className = "buttonText";
            takeSpanMgr.innerHTML = takeSheet["EmployeeID"] + " : " + takeSheet["Shift"];;
            document.getElementById(buttonID).appendChild(takeSpanMgr);

            // create the status section (to be filled in later) - <span class="rightTextDetail">Task Complete!</span>
            var takeSpanStatus = document.createElement("SPAN");
            var statusID = "stStatus" + i
            takeSpanStatus.className = "rightTextDetail";
            takeSpanStatus.id = statusID
            takeSpanStatus.innerHTML = 0;
            document.getElementById(buttonID).appendChild(takeSpanStatus);

            // add a newline
            var newline = document.createElement("BR");
            document.getElementById(buttonID).appendChild(newline);
            var sumIDs = ["spacer"]
                // add expected total - <div class="leftDetail"><span>Expected: </span><span class="detailTotal" id="PST">0</span></div>
            var expDiv = document.createElement("DIV");
            expDiv.className = "leftDetail";
            expDiv.id = "expDiv" + i;
            var detailTotalText = document.createElement("SPAN");
            detailTotalText.innerHTML = "Expected: "
            var detailTotalValue = document.createElement("SPAN");
            detailTotalValue.innerHTML = 0;
            detailTotalValue.className = "detailTotal";
            expTotalID = "takeExp" + i
            detailTotalValue.id = expTotalID;
            sumIDs.push(expTotalID); //add ID to the list for 
            document.getElementById(buttonID).appendChild(expDiv);
            document.getElementById(expDiv.id).appendChild(detailTotalText);
            document.getElementById(expDiv.id).appendChild(detailTotalValue);

            // add actual total - same as above
            var actDiv = document.createElement("DIV");
            actDiv.className = "centerDetail";
            actDiv.id = "actDiv" + i;
            var detailTotalText = document.createElement("SPAN");
            detailTotalText.innerHTML = "Actual: "
            var detailTotalValue = document.createElement("SPAN");
            detailTotalValue.innerHTML = 0;
            detailTotalValue.className = "detailTotal";
            actTotalID = "takeAct" + i;
            detailTotalValue.id = actTotalID;
            sumIDs.push(actTotalID); //add ID to the list for 
            document.getElementById(buttonID).appendChild(actDiv);
            document.getElementById(actDiv.id).appendChild(detailTotalText);
            document.getElementById(actDiv.id).appendChild(detailTotalValue);

            // add difference total - same as above
            var diffDiv = document.createElement("DIV");
            diffDiv.className = "rightDetail";
            diffDiv.id = "diffDiv" + i;
            var detailTotalText = document.createElement("SPAN");
            detailTotalText.innerHTML = "Difference: "
            var detailTotalValue = document.createElement("SPAN");
            detailTotalValue.innerHTML = 0;
            detailTotalValue.className = "detailTotal";
            diffTotalID = "takeDiff" + i
            detailTotalValue.id = diffTotalID;
            sumIDs.push(diffTotalID); //add ID to the list for updating
            document.getElementById(buttonID).appendChild(diffDiv);
            document.getElementById(diffDiv.id).appendChild(detailTotalText);
            document.getElementById(diffDiv.id).appendChild(detailTotalValue);

            //add the hidden div for detailed content - <div class="content">
            var takeDetailID = "takeDetailID" + i;
            var takeDetailDiv = document.createElement("DIV");
            takeDetailDiv.className = "content";
            takeDetailDiv.id = takeDetailID;
            document.getElementById(takeDivID).appendChild(takeDetailDiv);

            //console.log(sumIDs);
            var table = document.createElement("table"); // Create a table element
            table.className = "sumTable"
            var header = table.createTHead("header");
            var tr = header.insertRow(-1);
            var headerList = ["Payment", "Expected", "Actual", "Difference"]

            // Figure out how to get the header in there        var theader = document.createElement() 
            for (var j = 0; j < headerList.length; j++) {

                // Create the table header the element
                var rheader = document.createElement("th");
                rheader.innerHTML = headerList[j];

                // Append columnName to the table row 
                tr.appendChild(rheader);
            }
            var body = table.createTBody("body");
            var takes = takeSheet.Takes;
            // console.log(takes)
            for (var j = 0; j < takes.length; j++) { // for each of the take sheets
                var tr = body.insertRow(-1);
                var take = takes[j];
                //fill in the cells for the take values
                for (var k = 0; k < headerList.length; k++) {
                    var cell = tr.insertCell(-1);
                    if (k == 0) {
                        cell.className = "sumRow";
                    } else {
                        cell.className = "sumValue";
                        sumStaffTakeCell = Number(document.getElementById(sumIDs[k]).innerHTML) + Number(take[headerList[k]])
                        document.getElementById(sumIDs[k]).innerHTML = sumStaffTakeCell;
                    }
                    cell.innerHTML = take[headerList[k]];
                }
                //update the status of the staff take
                curStatus = document.getElementById(statusID).innerHTML;
                document.getElementById(statusID).innerHTML = Number(curStatus) + Number(take["Status"]);
            }

            //add the table to the detail tab
            document.getElementById(takeDetailID).appendChild(table);

            // change the background by changing the class if the status is incomplete
            stStatus = document.getElementById(statusID).innerHTML
            if (stStatus == 0) {
                document.getElementById(statusID).innerHTML = "Complete!";
                document.getElementById("takeProgress").value = Number(document.getElementById("takeProgress").value) + 1;
            } else {
                document.getElementById(buttonID).style.backgroundColor = "#FCAE1E";
                document.getElementById(statusID).innerHTML = "Incomplete!";
            }

            document.getElementById("takeProgress")
        }
        takeExpand();
    }

    // send the request
    request.send()
}

function onLoadTask() {
    loadTakeSheets();
}