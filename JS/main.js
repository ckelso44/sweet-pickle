/**  Add the user name and permission to the cookie profile */
function setProfile() {
    var resURL = gURL + '/staff?resID=' + getResID() + '&UserID=' + getUserID();
    console.log(resURL)
    var cookieData = getCookie('spProfile')
    console.log(cookieData)
    var request = new XMLHttpRequest();

    request.open('GET', resURL, true);

    request.onload = function() {
        // Begin accessing JSON data here
        var staff = JSON.parse(this.response);

        if (staff != false) {
            var cProfile = new Object
            cProfile = JSON.parse(getCookie('spProfile'))
            staffData = staff.Staff[0];
            console.log(cProfile);

            cProfile.FullName = staffData.FullName;
            console.log(staffData.FullName)
            console.log(cProfile)
            setCookie('spProfile', JSON.stringify(cProfile), 10)

            var cookieData = getCookie('spProfile')
            console.log(cookieData)
        }
        setMenu("Home", "Main")
    }

    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send();
}


/**   Load the main page */
function mainOnLoad() {
    setProfile()
}