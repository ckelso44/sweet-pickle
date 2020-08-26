/**  PURPOSE - create a login page to access the job files */
function clearUser() {
    document.getElementById("uNme").value = null
    document.getElementById("res").value = null
    document.getElementById("uNmeP").value = null
}

/**  PURPOSE - create a login page to access the job files */
function clearEmail() {
    document.getElementById("leml").value = null
    document.getElementById("lemlp").value = null
}

/**  PURPOSE - login a user by using their username */
function loginUser() {

    // ++ validate the user
    var empObj = {
        "username": document.getElementById("uNme").value,
        "restaurant": document.getElementById("res").value,
        "password": document.getElementById("uNmeP").value
    };

    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();
    var url = gURL + '/login?type=user'

    request.open('PATCH', url, true);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.onload = function() {
        var jsonResponse = JSON.parse(request.responseText);

        console.log(jsonResponse);

        if (jsonResponse.success == true) {
            // set cookie to allow for employee records to be retrieved
            var values = jsonResponse.value
            var profileObj = {
                "UserID": values["UserID"].toString(),
                "RestaurantID": values["ResID"].toString(),
                "RestaurantName": values["resName"].toString()
            }
            setCookie("spProfile", JSON.stringify(profileObj), 100)

            location.replace("resChoice.html");
        } else {
            let errorMsg = document.getElementById("loginErr")
            errorMsg.innerHTML = jsonResponse.message
            errorMsg.hidden = false;

        }
    };
    request.send(empJSON);
}

/**  PURPOSE - create a login page to access the job files */
function loginEmail() {

    // ++ validate the user
    var empObj = {
        "email": document.getElementById("leml").value,
        "password": document.getElementById("lemlp").value
    };

    var empJSON = JSON.stringify(empObj);
    var request = new XMLHttpRequest();
    var url = gURL + '/login?type=email'

    request.open('PATCH', url, true);

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.onload = function() {
        var jsonResponse = JSON.parse(request.responseText);

        console.log(jsonResponse);

        if (jsonResponse.success == true) {
            // set cookie to allow for employee records to be retrieved
            var values = jsonResponse.value
            var profileObj = { "UserID": values["UserID"].toString() }
            setCookie("spProfile", JSON.stringify(profileObj), 100)

            location.replace("resChoice.html");
        } else {
            document.getElementById("loginErr").hidden = false;
        }
    };
    request.send(empJSON);
}

/** Verify that fields are filled based on type of login eslected */
function loginOnClick() {
    var email = document.getElementById("leml").value
    var uName = document.getElementById("uNme").value
    if (email != null && email != "") {
        var password = document.getElementById("lemlp")
        if (password.value != null && password.value != "") {
            loginEmail()
        } else {
            let error = document.getElementById("loginErr")
            error.innerHTML = "The email requires a password"
            error.hidden = false
            password.focus()
        }
    } else if (uName != null && uName != "") {
        var restaurant = document.getElementById("res")
        if (restaurant.value != null && restaurant.value != "") {
            var password = document.getElementById("uNmeP")
            if (password.value != null && password.value != "") {
                loginUser()
            } else {
                let error = document.getElementById("loginErr")
                error.innerHTML = "The username requires a password"
                error.hidden = false
                password.focus()
            }
        } else {
            let error = document.getElementById("loginErr")
            error.innerHTML = "Logging in by User Name requires you specify a restaurant"
            error.hidden = false
            restaurant.focus()
        }

    } else {
        error.innerHTML = "You must specify either a Email or User Name to login"
        error.hidden = false
        document.getElementById("leml").focus()
    }
}

/**
 * Load the page and clear any prefilled values
 * @param none
 */
function loginOnLoad() {
    clearEmail()
    clearUser()
}

/** ----- functions for logout.html ------------------- */

function logoutOnLoad() {
    setCookie(spProfile, null, 0) //clear the cookie for the user
}