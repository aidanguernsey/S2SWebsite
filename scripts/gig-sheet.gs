// Logs gig requests from the website into a Google Sheet.
//
// Setup (see README → "Gig request spreadsheet"):
// 1. In the Google Sheet, open Extensions → Apps Script and replace the
//    contents of Code.gs with this file.
// 2. Deploy → New deployment → type "Web app".
//    Execute as: Me. Who has access: Anyone.
// 3. Copy the Web app URL (ends in /exec) into GIG_SHEET_URL.
//
// After editing this script, use Deploy → Manage deployments → Edit →
// Version: New version, so the URL keeps working with the new code.

const HEADERS = [
  "Received",
  "Name",
  "Email",
  "Event type",
  "Event date",
  "Event time",
  "Location",
  "Details",
];

// A leading ' stops Sheets from treating submitted text as a formula.
function safe(value) {
  const s = String(value || "");
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

  sheet.appendRow([
    new Date(),
    ...[
      data.name,
      data.email,
      data.eventType,
      data.date,
      data.time,
      data.location,
      data.details,
    ].map(safe),
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}
