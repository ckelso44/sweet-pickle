// Main script page for the Status and general admin pages

// Check if the API is connecting and the database status
// Trigers -    Status page body On Load
//              Ping Button Press
// Inputs - <None>
// Outputs - <None>
function pingAPI() {

    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/ping';
    var sDate = new Date();
    var sTime = sDate.getTime();

    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        var tDate = new Date();
        var tTime = tDate.getTime() - sTime;
        var resAPI = "Successful Connection to: " + gURL + "<br>";
        resAPI = resAPI + "Response Status: " + this.status + "<br>";
        resAPI = resAPI + "All Header Information: " + this.getAllResponseHeaders() + "<br>";
        resAPI = resAPI + "--- Data Base connection ---" + "<br>";
        resAPI = resAPI + "Database tables: " + JSON.parse(this.response) + "<br>";
        resAPI = resAPI + "--- Performance ---" + "<br>";
        resAPI = resAPI + "Total Execution Time: " + tTime + "ms";


        // post results to page
        document.getElementById("response").innerHTML = resAPI
    }

    // Send request
    request.send()
}

function adminOnLoad() {
    // initialize the page and validate the user
    //setMenu()
    pingAPI()
}