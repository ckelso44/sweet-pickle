// function myFunction - for use with Top Navigation bar
// Referece: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_topnav

function myFunction() {
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}