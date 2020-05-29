/* PURPOSE - create a login page to access the job files
 *    INPUTS - None
 *    RETURNS - None
 */

function loginUser() {

    // ++ validate the user
    var empObj = {
        "email": document.getElementById("email").value,
        "password": document.getElementById("password").value
    };

    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();
    var url = gURL + '/login'

    request.open('PATCH', url, true);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.onload = function() {
        var jsonResponse = JSON.parse(request.responseText);

        console.log(jsonResponse);

        if (jsonResponse != "False") {
            // set cookie to allow for employee records to be retrieved
            var profileObj = { "PrefName": jsonResponse["PrefName"], "UserID": jsonResponse["UserID"].toString() }
            setCookie("spProfile", JSON.stringify(profileObj), 100)

            location.replace("resChoice.html");
        } else {
            document.getElementById("loginErr").hidden = false;
        }
    };
    request.send(empJSON);
}