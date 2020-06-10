// function myFunction - for use with Top Navigation bar
// Referece: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_topnav

function topNav() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
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

// Check if the employee already exists in the system
// Triggers -   Body onload of main.html
// Inputs -     <None> 
// Outputs -    <None>
function mainOnLoad() {
    var JSONProfile = getCookie("spProfile")
    objProfile = JSON.parse(JSONProfile)
    userID = objProfile.UserID
    resID = objProfile.RestaurantID
    console.log(userID + ", " + resID)

    if (userID == "") {
        location.replace("login.html")
    }
    document.getElementById("profileName").innerHTML = "Welcome " + objProfile.PrefName
}