/* JS page for the take sheet home page */

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
function loadWeekTakes() {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    var startDate = '2020-05-01'
    var endDate = '2020-06-07'
    var resURL = gURL + '/dailytake/bydate?resID=' + getResID() + '&startdate=' + startDate + '&enddate=' + endDate;
    console.log(resURL);

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        var request = JSON.parse(this.response);
        dtData = request.DailyTakes;
        console.log(dtData);
        var cardDate = startDate
        var todayDate = "2020-05-05"
            // go through each day of the week and determine which card to build
        for (i = 0; i < 7; i++) {
            var found = false
                //find the record for the date
            console.log(cardDate)
            var status = 'undefined'
            for (j = 0; j < dtData.length; j++) {
                if (dtData[j].Date == cardDate) {
                    found = true
                    if (cardDate == todayDate) {
                        addCard(dtData[j], "In-progress", days[i])
                    } else if (cardDate <= todayDate) {
                        if (dtData[j].Status == "0") {
                            addCard(dtData[j], "Complete", days[i])
                        } else {
                            addCard(dtData[j], "Incomplete", days[i])
                        }
                    } else {
                        addCard(dtData[j], "Ready", days[i])
                    }
                }
            }
            if (found == false) {
                noCard(cardDate, days[i])
            }
            cardDate = dayChange(cardDate, 1)
        }
    }

    // send the request
    request.send()
}

function takeHomeOnLoad() {

    setMenu()
    loadWeekTakes()

}