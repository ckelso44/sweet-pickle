//Test Data
var startDay = "Monday"
    // Designed to load to current page of the week

var testSumValues = {
    dayOfWeek: "Tuesday",
    sheets: 6,
    sheetsComplete: 4,
    CPCExpected: 70.5,
    CPCActual: 86,
    creditExpected: 1000,
    creditActual: 962.45,
    debitExpected: 847,
    debitActual: 911.12
}

function loadMainPage() {
    //Populate the main page
    calcSummary(testSumValues);
}

function calcSummary(sumValues) {

    var calcCPCDiff = sumValues["CPCActual"] - sumValues["CPCExpected"];
    var calcCreditDiff = sumValues["creditActual"] - sumValues["creditExpected"];
    var calcDebitDiff = sumValues["debitActual"] - sumValues["debitExpected"];
    var budgetSum = sumValues["CPCExpected"] + sumValues["creditExpected"] + sumValues["debitExpected"];
    var actualSum = sumValues["CPCActual"] + sumValues["creditActual"] + sumValues["debitActual"];
    var diffSum = calcCPCDiff + calcCreditDiff + calcDebitDiff;
    var gstSum = actualSum * 0.05;
    var pstSum = actualSum * 0.07;
    var netSum = gstSum + pstSum + actualSum
    var netProfit = netSum - budgetSum;

    //Title Bar
    document.getElementById("dayOfWeek").innerHTML = sumValues["dayOfWeek"];
    document.getElementById("sumProfit").innerHTML = CurrencyFormatted(netProfit);
    //Totals Sheet
    document.getElementById("CPCExpected").innerHTML = CurrencyFormatted(sumValues["CPCExpected"]);
    document.getElementById("CPCActual").innerHTML = CurrencyFormatted(sumValues["CPCActual"]);
    document.getElementById("CPCDiff").innerHTML = CurrencyFormatted(calcCPCDiff);

    document.getElementById("creditExpected").innerHTML = CurrencyFormatted(sumValues["creditExpected"]);
    document.getElementById("creditActual").innerHTML = CurrencyFormatted(sumValues["creditActual"]);
    document.getElementById("creditDiff").innerHTML = CurrencyFormatted(calcCreditDiff);

    document.getElementById("debitExpected").innerHTML = CurrencyFormatted(sumValues["debitExpected"]);
    document.getElementById("debitActual").innerHTML = CurrencyFormatted(sumValues["debitActual"]);
    document.getElementById("debitDiff").innerHTML = CurrencyFormatted(calcDebitDiff);

    document.getElementById("actualSum").innerHTML = CurrencyFormatted(actualSum);
    document.getElementById("diffSum").innerHTML = CurrencyFormatted(diffSum);

    //Details Sheet
    document.getElementById("GST").innerHTML = CurrencyFormatted(gstSum);
    document.getElementById("PST").innerHTML = CurrencyFormatted(pstSum);
    document.getElementById("budget").innerHTML = CurrencyFormatted(budgetSum);
    document.getElementById("netTotal").innerHTML = CurrencyFormatted(netSum);


}