CREATE VIEW stafftakeview
AS SELECT a.StaffTakeID, a.DailyTakeID, a.Shift, b.FullName
FROM StaffTake a, Employee b
WHERE a.EmployeeID=b.EmployeeID;
