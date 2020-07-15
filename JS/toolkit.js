// PURPOSE - JS file for use with all pages to hold global variables and common functions

// GLOBAL VARIABLES - 

var gURL = 'http://127.0.0.1:5003'

// Reference https://www.w3schools.com/js/js_cookies.asp

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// function CurrencyFormatted - converts a number value to a 2 decimal currency 
// Reference: https://css-tricks.com/snippets/javascript/format-currency/
function CurrencyFormatted(amount) {
    var i = parseFloat(amount);
    if (isNaN(i)) { i = 0.00; }
    var minus = '';
    if (i < 0) { minus = '-'; }
    i = Math.abs(i);
    i = parseInt((i + .005) * 100);
    i = i / 100;
    s = new String(i);
    if (s.indexOf('.') < 0) { s += '.00'; }
    if (s.indexOf('.') == (s.length - 2)) { s += '0'; }
    s = minus + s;
    return s;
}

// returns the user ID stored in the profile cookie
function getUserID() {
    profile = JSON.parse(getCookie("spProfile"));
    return Number(profile.userID);
}

//returns the restaurant ID stored in the profile cookie
function getResID() {
    profile = JSON.parse(getCookie("spProfile"));
    return Number(profile.RestaurantID);
}
/**
 * Get the URL parameters
 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */
var getParams = function(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    // console.log(params);
    return params;
};

/**
 * Return today's date in a format compatible to the database
 * @param  <none>
 * @return {string}     The date in a YYYY-MM-DD format
 */
var nowDate = function() {
    var d = new Date();
    var month = d.getMonth() + 1
    if (month < 10) { month = "0" + month }
    var day = d.getDate()
    if (day < 10) { day = "0" + day }
    var dateFormat = d.getFullYear() + '-' + month + '-' + day
    return (dateFormat);
}

/**
 * Return a date in the format compatible to the database
 * @param  date         Date object
 * @return {string}     The date in a YYYY-MM-DD format
 */
function formatDate(date) {
    var month = date.getMonth() + 1
    if (month < 10) { month = "0" + month }
    var day = date.getDate()
    if (day < 10) { day = "0" + day }
    var dateFormat = date.getFullYear() + '-' + month + '-' + day
    return (dateFormat);
}

/**
 * Return a date in the format compatible to the database
 * @param  <none>
 * @return {string}     The date in a YYYY-MM-DD format
 */
function dayOffset(sDate, tDate) {

    date1 = new Date(sDate)
    date2 = new Date(tDate)
        // To calculate the time difference of two dates 
    var Difference_In_Time = date1.getTime() - date2.getTime();

    // To calculate the no. of days between two dates 
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return (Difference_In_Days)
}

/**
 * Return a date offset by days compared to today's date 
 * @param   date        The date to compare in a YYYY-MM-DD format
 * @param   offset      The # of days to add or subtract from the date (+/-)
 * @return {date}       The date offset in a YYYY-MM-DD format    
 */
function dayChange(date, offset) {
    var d = new Date(date)
    var newDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + offset)
    var dateFormat = formatDate(newDate)
    return (dateFormat)
}

/**
 * Validate User
 */
function validateUser() {
    if (getUserID() == "") {
        location.replace("login.html")
    }
}

/**
 * Return a date in the format compatible to the database
 * @param  <none>
 * @return {string}     The date in a YYYY-MM-DD format
 */
function setMenu() {
    validateUser()
    var JSONProfile = getCookie("spProfile")
    objProfile = JSON.parse(JSONProfile)
    document.getElementById("resName").innerHTML = objProfile.RestaurantName
    document.getElementById("profile").innerHTML = "Profile: " + objProfile.PrefName
}