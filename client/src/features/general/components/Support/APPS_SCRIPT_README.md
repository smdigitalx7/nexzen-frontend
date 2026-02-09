# Google Apps Script for Professional Issue Reporting

Follow these steps to set up the backend for the "Report an Issue" popup.

## 1. Create a Google Sheet
- Create a new Google Sheet.
- Name it **"System Issue Tracker"**.
- Headers (Row 1): `Timestamp`, `Reporter Name`, `Email`, `Module/System`, `Summary`, `Description`, `Priority`, `Attachment Link`.

## 2. Open Script Editor
- In Google Sheets: **Extensions** > **Apps Script**.

## 3. Copy & Paste the Script
Replace everything with the code below:

```javascript
/**
 * Professional Issue Reporting API
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    // Handle File Attachment
    var fileUrl = "No Attachment";
    if (data.fileData && data.fileName) {
      var folderName = "Issue_Support_Uploads";
      var folders = DriveApp.getFoldersByName(folderName);
      var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
      
      var contentType = data.fileData.substring(5, data.fileData.indexOf(';'));
      var bytes = Utilities.base64Decode(data.fileData.split(',')[1]);
      var blob = Utilities.newBlob(bytes, contentType, data.fileName);
      var file = folder.createFile(blob);
      
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    }

    // Append Clean Data
    sheet.appendRow([
      data.timestamp || new Date(),
      data.userName,
      data.email,
      data.systemName,
      data.issueTitle,
      data.issueDescription,
      data.priority,
      fileUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 4. Deploy
1. Click **Deploy** > **New Deployment**.
2. Select **Web App**.
3. Description: "Issue Tracker v2".
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. **Deploy** and copy the **Web App URL**.

## 5. Final Step
Paste your URL into `IssueReportDialog.tsx`.
