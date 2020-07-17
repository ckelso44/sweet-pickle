/* JS page for the take sheet home page */
// chart functions

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart(null));

// Draw the chart and set the chart values
function drawChart(chartData) {
    var sampData = [
        ['Day', 'Actual Take'],
        ['Monday', 1234],
        ['Tuesday', 1345.56],
        ['Wednesday', 1145.43],
        ['Thursday', 545.23],
        ['Friday', 1476.23],
        ['Saturday', null],
        ['Sunday', null]
    ];

    if (chartData != null) {
        var data = google.visualization.arrayToDataTable(chartData)

        // Optional; add a title and set the width and height of the chart
        var options = {
            title: 'Weekly Take',
            legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById('takeChart'));
        chart.draw(data, options);
    }
}




//navigation functions for the week view
// navigate to the previous week
function prevWeek() {
    newDate = dayChange(gDate, -7)
    newUrl = "takehome.html?date=" + newDate
    document.location.href = newUrl;
}

//navigate to the next week
function nextWeek() {
    newDate = dayChange(gDate, 7)
    newUrl = "takehome.html?date=" + newDate
    document.location.href = newUrl;

}

//create the individual cards
function addCard(dTake, status, dow) {
    var card = document.createElement("div")
    cardDate = dTake["Date"]
    var createClickHandler = function(date) {
        return function() {
            location.replace("take.html?date=" + date);
        };
    }
    card.onclick = createClickHandler(cardDate);

    var statusImage = document.createElement("img")

    var container = document.createElement("div")
    container.className = "container"
    var pDay = document.createElement("h3")
    pDay.innerHTML = dow
    var pDate = document.createElement("h4")
    pDate.innerHTML = cardDate
    var pStatus = document.createElement("p")
    pStatus.innerHTML = status
    var pActual = document.createElement("p")
    pStatus.innerHTML = CurrencyFormatted(dTake.SumActual)
    var pBudget = document.createElement("p")
    pBudget.innerHTML = CurrencyFormatted(dTake.Budget)

    if (status == "In-progress") {
        statusImage.src = "../../IMAGES/star_today.png"
        statusImage.alt = "In-progress Icon"
        card.className = "card"
    }

    if (status == "Complete") {
        statusImage.src = "../../IMAGES/complete.png"
        statusImage.alt = "Complete Icon"
        card.className = "card card_complete"
    }

    if (status == "Incomplete") {
        statusImage.src = "../../IMAGES/incomplete.png"
        statusImage.alt = "Incomplete Icon"
        card.className = "card card_incomplete"
    }

    if (status == "Ready") {
        statusImage.src = "../../IMAGES/ready.png"
        statusImage.alt = "Ready Icon"
        card.className = "card card_ready"
    }
    // build the card
    card.appendChild(statusImage)
    card.appendChild(container)
    container.appendChild(pDay)
    container.appendChild(pDate)
    container.appendChild(pStatus)
    container.appendChild(pActual)
    container.appendChild(pBudget)
    document.getElementById("weekView").appendChild(card)
}

//create the individual cards
function noCard(cardDate, dow) {
    var card = document.createElement("div")
    card.className = "card card_undefined"
    var createClickHandler = function(date) {
        return function() {
            location.replace("take.html?date=" + date);
        };
    }
    card.onclick = createClickHandler(cardDate);

    var statusImage = document.createElement("img")
    statusImage.src = "../../IMAGES/undefined.png"
    statusImage.alt = "Undefined Icon"

    var container = document.createElement("div")
    container.className = "container"
    var pDay = document.createElement("h3")
    pDay.innerHTML = dow
    var pDate = document.createElement("h4")
    pDate.innerHTML = cardDate
    var pMessage = document.createElement("p")
    pMessage.innerHTML = "No take sheet for this day"
    card.appendChild(statusImage)
    card.appendChild(container)
    container.appendChild(pDay)
    container.appendChild(pDate)
    container.appendChild(pMessage)
    document.getElementById("weekView").appendChild(card)
}

//load the 7 day takes into cards
function loadWeekTakes(stDate, enDate) {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    startDate = formatDate(stDate)
    endDate = formatDate(enDate)
    var resURL = gURL + '/dailytake/bydate?resID=' + getResID() + '&startdate=' + startDate + '&enddate=' + endDate;
    // console.log(resURL);

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        var request = JSON.parse(this.response);
        dtData = request.DailyTakes;
        // console.log(dtData);
        var cardDate = startDate
        var todayDate = nowDate()
        var chartData = new Array()
        var axis = ['Day', 'Actual Take']
        chartData.push(axis)
            // go through each day of the week and determine which card to build
        for (i = 0; i < 7; i++) {
            var found = false
            var dataPair = [days[i]]
            for (j = 0; j < dtData.length; j++) {
                if (dtData[j].Date == cardDate) {
                    found = true
                        // console.log(cardDate)
                    if (cardDate == todayDate) {
                        addCard(dtData[j], "In-progress", days[i])
                    } else if (cardDate < todayDate) {
                        if (dtData[j].Status == 0) {
                            addCard(dtData[j], "Complete", days[i])
                        } else {
                            addCard(dtData[j], "Incomplete", days[i])
                        }
                    } else {
                        addCard(dtData[j], "Ready", days[i])
                    }
                    dataPair.push(Number(dtData[j].SumActual))
                        //console.log(dataPair)
                }
            }
            if (found == false) {
                noCard(cardDate, days[i])
                dataPair.push(null)
            }
            chartData.push(dataPair)
            cardDate = dayChange(cardDate, 1)
        }
        // Display the chart inside the <div> element with id="takeChart"
        drawChart(chartData)
    }

    // send the request
    request.send()
}

function takeHomeOnLoad() {

    // initialize the page and validate the user
    setMenu()

    //grab the date from the URL. If no date, assume today
    var pageParams = getParams(window.location.href)
    if ("date" in pageParams) {
        gDate = pageParams["date"];
    } else {
        gDate = nowDate()
    }
    offset = dayOffset(gDate, nowDate())
        //console.log("URL date= " + pageParams["date"] + ", gDate = " + gDate + ", offset= " + offset)

    // check what day of the week it is to offset the start and end dates
    var dayOfWeek = new Date(gDate)

    var weekDay = dayOfWeek.getUTCDay()
    var resStartOfWeek = 1 // the start of week will be eventually set by a preference
    var sDate = new Date(dayOfWeek.getUTCFullYear(), dayOfWeek.getUTCMonth(), dayOfWeek.getUTCDate() - weekDay + resStartOfWeek)

    //sDate.setUTCDate(dayOfWeek.getUTCDate() - weekDay + resStartOfWeek) //adjust based on start of week 
    var eDate = new Date(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate() + 6)
        //console.log("day of week= " + dayOfWeek + ", startDate = " + sDate + ", end date: " + eDate)

    // set the label for the page based on the week the target date falls into
    if (offset > -6 && offset < 7) {
        document.getElementById("dtDate").innerHTML = "This Week";
    } else if (offset > -13 && offset < -6) {
        document.getElementById("dtDate").innerHTML = "Last Week";
    } else if (offset < 14 && offset > 6) {
        document.getElementById("dtDate").innerHTML = "Next Week";
    } else {
        document.getElementById("dtDate").innerHTML = "Week of: " + formatDate(sDate);
    }


    loadWeekTakes(sDate, eDate)
}