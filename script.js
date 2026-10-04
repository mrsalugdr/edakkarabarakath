const SHEET_NAME = "Customers";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: "Edakkara Barakath API is working"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet =
      SpreadsheetApp
        .getActiveSpreadsheet()
        .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Customers sheet not found");
    }

    // LOAD CUSTOMERS
    if (data.action === "getCustomers") {
      const lastRow = sheet.getLastRow();

      if (lastRow < 2) {
        return jsonResponse({
          success: true,
          customers: []
        });
      }

      const values =
        sheet
          .getRange(2, 1, lastRow - 1, 15)
          .getValues();

      const customers = values
        .filter(row => row[0])
        .map(row => ({
          referenceId: row[0],
          customerName: row[1],
          phone: row[2],
          place: row[3],
          receivedDate: row[4],
          deliveryDate: row[5],
          itemType: row[6],
          quantity: row[7],
          measurements: row[8],
          specialNotes: row[9],
          stitchingStatus: row[10],
          totalAmount: row[11],
          advance: row[12],
          balance: row[13],
          whatsappStatus: row[14]
        }));

      return jsonResponse({
        success: true,
        customers: customers
      });
    }

    // FIND NEXT EMPTY ROW
    const referenceValues =
      sheet.getRange("A2:A").getValues();

    let rowNumber = 2;

    for (let i = 0; i < referenceValues.length; i++) {
      if (!referenceValues[i][0]) {
        rowNumber = i + 2;
        break;
      }
    }

    // REFERENCE STARTS FROM EB-0300
    const referenceId =
      "EB-" +
      String(rowNumber + 298).padStart(4, "0");

    // AMOUNT CALCULATION
    const totalAmount =
      Number(data.totalAmount || 0);

    const advance =
      Number(data.advance || 0);

    const balance =
      totalAmount - advance;

    // SAVE CUSTOMER
    sheet
      .getRange(rowNumber, 1, 1, 15)
      .setValues([[
        referenceId,
        data.customerName || "",
        data.phone || "",
        data.place || "",
        data.receivedDate || "",
        data.deliveryDate || "",
        data.itemType || "",
        data.quantity || "",
        data.measurements || "",
        data.specialNotes || "",
        data.stitchingStatus || "Received",
        totalAmount,
        advance,
        balance,
        "Not Sent"
      ]]);

    return jsonResponse({
      success: true,
      referenceId: referenceId,
      message: "Customer saved successfully"
    });

  } catch (error) {

    return jsonResponse({
      success: false,
      error: error.message
    });

  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
