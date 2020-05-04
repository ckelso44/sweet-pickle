var startDay = "Monday"
    // Designed to load to current page of the week

function loadMainPage() {
    var defaultValues = {
        dayOfWeek: "Tuesday",
        sheets: 6,
        sheeteComplete: 4,
        CPCExpected: 70.5,
        CPCActual: 86,
        creditExpected: 1000,
        creditActual: 962.45,
        debitExpected: 847,
        debitActual: 911.12
    }
    document.getElementById("dayOfWeek").innerHTML = defaultValues["dayOfWeek"];

    document.getElementById("CPCExpected").innerHTML = CurrencyFormatted(defaultValues["CPCExpected"]);
    document.getElementById("CPCActual").innerHTML = CurrencyFormatted(defaultValues["CPCActual"]);
    var calcCPCDiff = defaultValues["CPCActual"] - defaultValues["CPCExpected"];
    document.getElementById("CPCDiff").innerHTML = CurrencyFormatted(calcCPCDiff);

    document.getElementById("creditExpected").innerHTML = CurrencyFormatted(defaultValues["creditExpected"]);
    document.getElementById("creditActual").innerHTML = CurrencyFormatted(defaultValues["creditActual"]);
    var calcCreditDiff = defaultValues["creditActual"] - defaultValues["creditExpected"];
    document.getElementById("creditDiff").innerHTML = CurrencyFormatted(calcCreditDiff);

    document.getElementById("debitExpected").innerHTML = CurrencyFormatted(defaultValues["debitExpected"]);
    document.getElementById("debitActual").innerHTML = CurrencyFormatted(defaultValues["debitActual"]);
    var calcDebitDiff = defaultValues["debitActual"] - defaultValues["debitExpected"];
    document.getElementById("debitDiff").innerHTML = CurrencyFormatted(calcDebitDiff);

    document.getElementById("actualSum").innerHTML =
        CurrencyFormatted(defaultValues["CPCActual"] + defaultValues["creditActual"] + defaultValues["debitActual"]);
    document.getElementById("diffSum").innerHTML =
        CurrencyFormatted(calcCPCDiff + calcCreditDiff + calcDebitDiff);

}