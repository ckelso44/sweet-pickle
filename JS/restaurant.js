// designed for functions related to the Restaurant Administrative activites

/**
 * Enable the Save and Reject   ` buttons
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
 * Enable the Save and Reject   ` buttons
 */
function saveRes() {
    alert("Haven't implemented this yet, try again later maybe?");
}

function cancelRes() {
    location.reload();
}

/**
 * Add two numbers together
 * @param  {string} resID Restaurant ID to lookup
 */
function loadRes(resID) {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
        //check URL, if no parameter then assume today
    var resURL = gURL + '/restaurant?resID=' + resID;

    request.open('GET', resURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var request = JSON.parse(this.response);

        // check if no records were returned, if so, trigger to create a new Daily Task
        resData = request.Restaurants[0]
        console.log(resData)
        document.getElementById("rName").value = resData["Name"]
        document.getElementById("rID").value = resData["RestaurantID"]
        document.getElementById("address").value = resData["LocAddress"]
        document.getElementById("address2").value = resData["LocAddress2"]
        document.getElementById('city').value = resData["LocCity"]
        document.getElementById('region').value = resData["LocRegion"]
        document.getElementById("country").value = resData["LocCountry"]
        document.getElementById("code").value = resData["LocCode"]
    }

    // send the request
    request.send()
}


/**
 * Loads the main page for restaurant.html
 */
function resOnLoad() {
    setMenu("My Restaurant", "Admin")
        //load details for the res
    loadRes(getResID())
}