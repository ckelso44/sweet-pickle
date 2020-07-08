function loadList() {
    var request = new XMLHttpRequest() // Create a request variable and assign a new XMLHttpRequest object to it.
    appURL = gURL + '/restaurant';

    request.open('GET', appURL, true) // Open a new connection, using the GET request on the URL endpoint

    request.onload = function() {
        // Begin accessing JSON data here
        // Begin accessing JSON data here
        var dataRes = JSON.parse(this.response);
        resData = dataRes.Restaurants;

        var cols = [];
        for (var i = 0; i < resData.length; i++) {
            for (var k in resData[i]) {
                if (cols.indexOf(k) === -1) {
                    cols.push(k); // Push all keys to the array 
                }
            }
        }
        // console.log(appData);
        // console.log(appData[1].ApplicationID);

        var table = document.createElement("table"); // Create a table element 
        var tr = table.insertRow(-1);
        var headerList = ["ID", "Name", "Status", "Active", "Create Date", "Last Updated"]
        var dataList = ["RestaurantID", "Name", "Status", "Active", "CreateDate", "ModDate"]

        for (var i = 0; i < headerList.length; i++) {

            // Create the table header the element 
            var theader = document.createElement("th");
            theader.innerHTML = headerList[i];

            // Append columnName to the table row 
            tr.appendChild(theader);
        }

        // Adding the data to the table 
        for (var i = 0; i < resData.length; i++) {

            // Create a new row 
            trow = table.insertRow(-1);
            // Add onclick handler to the row
            var createClickHandler = function(row, resId) {
                return function() {
                    var cell = row.getElementsByTagName("td")[0];
                    // console.log(appId)
                    location.replace("restaurant.html?resID=" + resId);
                };
            }
            var id = resData[i].RestaurantID;
            trow.onclick = createClickHandler(trow, id);

            for (var j = 0; j < dataList.length; j++) {
                var cell = trow.insertCell(-1);

                // Inserting the cell at particular place 
                cell.innerHTML = resData[i][dataList[j]];
            }
        }
        // Add the newely created table containing json data 
        var el = document.getElementById("resTable");
        el.innerHTML = "";
        el.appendChild(table);
    }

    // Send request
    request.send()
}