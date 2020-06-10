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

function getUserID() {
    userID = getCookie("activeUserID");
    return Number(userID);
}

function getResID() {
    resID = getCookie("RestaurantID");
    return Number(resID);
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
 * Return a date in the format compatible to the database
 * @param  <none>
 * @return {string}     The date in a YYYY-MM-DD format
 */
var nowDateUTC = function() {
    var date = new Date();
    var month = date.getUTCMonth()
    if (month < 10) { month = "0" + month }
    var day = date.getUTCDay()
    if (day < 10) { day = "0" + day }
    var dateFormat = date.getUTCFullYear() + '-' + month + '-' + day
    return (dateFormat);
}