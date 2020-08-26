//-- DropZone File Upload functions https://gist.github.com/MichaelCurrie/19394abc19abd0de4473b595c0e37a3a

// Handle drag and drop into a dropzone_element div:
// send the files as a POST request to the server
"use strict";

// Only start once the DOM tree is ready
if (document.readyState === "complete") {
    createDropzoneMethods();
} else {
    document.addEventListener("DOMContentLoaded", createDropzoneMethods);
}

function createDropzoneMethods() {
    let dropzone = document.getElementById("dropzone_element");

    // highlist the dropzone on dragover
    dropzone.ondragover = function() {
        this.className = "dropzone dragover";
        return false;
    }

    // change back the dropzone highlighting if they cancel
    dropzone.ondragleave = function() {
        this.className = "dropzone";
        return false;
    }

    // trigger the upload function if they drop
    dropzone.ondrop = function(e) {
        // Stop browser from simply opening that was just dropped
        e.preventDefault();
        // Restore original dropzone appearance
        this.className = "dropzone";

        upload_files(e.dataTransfer.files)
    }
}

function upload_files(files) {
    let upload_results = document.getElementById("upload_results_element");
    let formData = new FormData(), // files object
        request = new XMLHttpRequest();

    console.log("Dropped " + String(files.length) + " files.");
    for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
    }

    var resURL = gURL + '/dailytake/import?resID=' + getResID();


    request.onreadystatechange = function() {
        if (request.readyState === XMLHttpRequest.DONE) {
            alert(request.responseText);
        }

        console.log(request.response);
        upload_results.innerHTML = this.response;
    }

    console.log("Let's upload files: ", formData);

    request.open('POST', resURL, true); // async = true

    // request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(formData);
}


//--------------------------- My Main functions ---------------------------------------------

/**
 * Main function to load the upload page
 */
function uploadOnLoad() {
    console.log("OnLoad page")
    setMenu("Upload Take", "Take")
}


/**
 * Upload the selected file
 * @param {File}    File The File blob to be posted
 */
function postFile(File) {

    let upload_results = document.getElementById("myfile");
    let formData = new FormData(), // files object
        request = new XMLHttpRequest();

    console.log("Selected " + String(files.length) + " files.");
    for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
    }

    var resURL = gURL + '/dailytake/import?resID=' + getResID();

    request.open('POST', resURL, true);

    request.onload = function() {
        // Begin accessing JSON data here
        var result = JSON.parse(this.response);
        if (result == true) {
            console.log("successful post")
        } else {
            console.log("failed to post")
        }
    }

    //request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    request.send(empJSON);
}


/**
 * Upload the selected file
 */
function uploadFile() {
    console.log("Upload file")
    var myfile = document.getElementById("myfile")

    let file = myfile.files[0]
    console.log(file)
    postFile(file)
    let reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = function() {
        console.log(reader.result);
        //postFile(reader.result)
    };

    reader.onerror = function() {
        console.log(reader.error);
    };
}