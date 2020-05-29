//Test Data
var startDay = "Monday"
    // Designed to load to current page of the week

var testSumValues = {
    dayOfWeek: "Tuesday",
    sheets: 6,
    sheetsComplete: 4,
    CPCExpected: 70.5,
    CPCActual: 86,
    creditExpected: 1000,
    creditActual: 962.45,
    debitExpected: 847,
    debitActual: 911.12
}

var gTakeSheets = {
    "takeSheets": [{
            "takeID": 1,
            "shiftManager": "Cindy Lou",
            "shift": "Day Shift",
            "expected": 200,
            "actual": 210,
            "difference": 10,
            "takeEntries": [{
                    "payment": "Cash",
                    "expected": 34.00,
                    "actual": 42.00,
                    "difference": 8
                },
                {
                    "payment": "Petty Cash",
                    "expected": 400.00,
                    "actual": 420.00,
                    "difference": 20,
                },
                {
                    "payment": "Credit",
                    "expected": 500.00,
                    "actual": 490.00,
                    "difference": 10.00
                },
                {
                    "payment": "Debit",
                    "expected": "",
                    "actual": "",
                    "difference": ""
                }
            ],
            "status": "Incomplete"
        },
        {
            "takeID": 2,
            "shiftManager": "Cindy Lou",
            "shift": "Night Shift",
            "expected": 521.89,
            "actual": 522.99,
            "difference": 1.10,
            "takeEntries": [{
                    "payment": "Cash",
                    "expected": 31.00,
                    "actual": 33.00,
                    "difference": 2
                },
                {
                    "payment": "Petty Cash",
                    "expected": 380.00,
                    "actual": 379.00,
                    "difference": -1,
                },
                {
                    "payment": "Credit",
                    "expected": 589.72,
                    "actual": 591.73,
                    "difference": 2.01
                },
                {
                    "payment": "Debit",
                    "expected": 188.15,
                    "actual": 188.15,
                    "difference": 0
                }
            ],
            "status": "Complete"

        }

    ]
}

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

function loadMainPage() {
    //Populate the main page
    calcSummary(testSumValues);
}

function calcSummary(sumValues) {

    var calcCPCDiff = sumValues["CPCActual"] - sumValues["CPCExpected"];
    var calcCreditDiff = sumValues["creditActual"] - sumValues["creditExpected"];
    var calcDebitDiff = sumValues["debitActual"] - sumValues["debitExpected"];
    var budgetSum = sumValues["CPCExpected"] + sumValues["creditExpected"] + sumValues["debitExpected"];
    var actualSum = sumValues["CPCActual"] + sumValues["creditActual"] + sumValues["debitActual"];
    var diffSum = calcCPCDiff + calcCreditDiff + calcDebitDiff;
    var gstSum = actualSum * 0.05;
    var pstSum = actualSum * 0.07;
    var netSum = gstSum + pstSum + actualSum
    var netProfit = netSum - budgetSum;

    //Title Bar
    document.getElementById("dayOfWeek").innerHTML = sumValues["dayOfWeek"];
    document.getElementById("sumProfit").innerHTML = CurrencyFormatted(netProfit);
    //Totals Sheet
    document.getElementById("CPCExpected").innerHTML = CurrencyFormatted(sumValues["CPCExpected"]);
    document.getElementById("CPCActual").innerHTML = CurrencyFormatted(sumValues["CPCActual"]);
    document.getElementById("CPCDiff").innerHTML = CurrencyFormatted(calcCPCDiff);

    document.getElementById("creditExpected").innerHTML = CurrencyFormatted(sumValues["creditExpected"]);
    document.getElementById("creditActual").innerHTML = CurrencyFormatted(sumValues["creditActual"]);
    document.getElementById("creditDiff").innerHTML = CurrencyFormatted(calcCreditDiff);

    document.getElementById("debitExpected").innerHTML = CurrencyFormatted(sumValues["debitExpected"]);
    document.getElementById("debitActual").innerHTML = CurrencyFormatted(sumValues["debitActual"]);
    document.getElementById("debitDiff").innerHTML = CurrencyFormatted(calcDebitDiff);

    document.getElementById("actualSum").innerHTML = CurrencyFormatted(actualSum);
    document.getElementById("diffSum").innerHTML = CurrencyFormatted(diffSum);

    //Details Sheet
    document.getElementById("GST").innerHTML = CurrencyFormatted(gstSum);
    document.getElementById("PST").innerHTML = CurrencyFormatted(pstSum);
    document.getElementById("budget").innerHTML = CurrencyFormatted(budgetSum);
    document.getElementById("netTotal").innerHTML = CurrencyFormatted(netSum);
}

function loadTakeSheets() {
    var takeData = gTakeSheets.takeSheets;

    for (var i = 0; i < takeData.length; i++) {
        var takeSheet = takeData[i];
        console.log(takeSheet);
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
        takeSpanMgr.innerHTML = takeSheet["shiftManager"] + " : " + takeSheet["shift"];;
        document.getElementById(buttonID).appendChild(takeSpanMgr);

        // set the status - <span class="rightTextDetail">Task Complete!</span>
        var takeSpanStatus = document.createElement("SPAN");
        takeSpanStatus.className = "rightTextDetail";
        takeSpanStatus.innerHTML = takeSheet["status"] + "!";

        // change the background by changing the class if the status is incomplete
        if (takeSheet["status"] == "Incomplete") {
            document.getElementById(buttonID).class = "collapsibleErr";
        }

        document.getElementById(buttonID).appendChild(takeSpanStatus);

        // add a newline
        var newline = document.createElement("BR");
        document.getElementById(buttonID).appendChild(newline);

        // add expected total - <div class="leftDetail"><span>Expected: </span><span class="detailTotal" id="PST">0</span></div>
        var expDiv = document.createElement("DIV");
        expDiv.className = "leftDetail";
        expDiv.id = "expDiv" + i;
        var detailTotalText = document.createElement("SPAN");
        detailTotalText.innerHTML = "Expected: "
        var detailTotalValue = document.createElement("SPAN");
        detailTotalValue.innerHTML = takeSheet["expected"];
        detailTotalValue.className = "detailTotal";
        detailTotalValue.id = "takeExp" + i;
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
        detailTotalValue.innerHTML = takeSheet["expected"];
        detailTotalValue.className = "detailTotal";
        detailTotalValue.id = "takeAct" + i;
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
        detailTotalValue.innerHTML = takeSheet["difference"];
        detailTotalValue.className = "detailTotal";
        detailTotalValue.id = "takeDiff" + i;
        document.getElementById(buttonID).appendChild(diffDiv);
        document.getElementById(diffDiv.id).appendChild(detailTotalText);
        document.getElementById(diffDiv.id).appendChild(detailTotalValue);

        //add the hidden div for detailed content - <div class="content">
        var takeDetailID = "takeDetailID" + i;
        var takeDetailDiv = document.createElement("DIV");
        takeDetailDiv.className = "content";
        takeDetailDiv.id = takeDetailID;
        document.getElementById(takeDivID).appendChild(takeDetailDiv);

        var table = document.createElement("table"); // Create a table element
        table.className = "sumTable"
        var header = table.createTHead("header");
        var tr = header.insertRow(-1);
        var headerList = ["Payment", "Budget", "Actual", "Difference"]


        // Figure out how to get the header in there        var theader = document.createElement() 
        for (var j = 0; j < headerList.length; j++) {

            // Create the table header the element
            var rheader = document.createElement("th");
            rheader.innerHTML = headerList[j];

            // Append columnName to the table row 
            tr.appendChild(rheader);
        }
        var body = table.createTBody("body");
        var takePayment = takeSheet.takeEntries;
        console.log(takePayment)
        for (var j = 0; j < takePayment.length; j++) {
            var tr = body.insertRow(-1);
            var rPayment = takePayment[j];
            var payCount = Object.keys(rPayment).length;
            var payKeys = Object.keys(rPayment);
            /* troubleshooting section when I had to explicity treat it as an object
            console.log(j);
            console.log(rPayment);
            console.log(rPayment["payment"]);
            console.log(payKeys[0]);
            console.log(payCount);
            */
            for (var k = 0; k < payCount; k++) {
                var cell = tr.insertCell(-1);
                if (k == 0) {
                    cell.className = "sumRow"
                } else { cell.className = "sumValue" }
                cell.innerHTML = rPayment[payKeys[k]];
            }
        }
        // create the row for cash
        /* old way
        var trow = body.insertRow(-1);
        var tcell = trow.insertCell(-1);
        tcell.className = "sumRow";
        tcell.innerHTML = "Cash";

        var cExpected = takeSheet["cExpected"]
        var tcell = trow.insertCell(-1);
        tcell.className = "sumValue";
        tcell.innerHTML = cExpected;

        var cActual = takeSheet["cActual"]
        var tcell = trow.insertCell(-1);
        tcell.className = "sumValue";
        tcell.innerHTML = cActual;

        var cDiff = cActual - cExpected
        var tcell = trow.insertCell(-1);
        tcell.className = "sumValue";
        tcell.innerHTML = cDiff;
        */


        //add the table to the detail tab
        document.getElementById(takeDetailID).appendChild(table);
        console.log(i);
    }
}

function onLoadTask() {
    loadTakeSheets();
    takeExpand();
}