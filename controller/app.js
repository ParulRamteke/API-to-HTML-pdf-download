const puppeteer = require('puppeteer');
const fetch = require("node-fetch");
const numberToWords = require("number-to-words");
const ejs = require("ejs"); // Import ejs
const path = require("path");


// Define the calculateTotalKm function
function calculateTotalKm(From, To) {
  if (From !== undefined && To !== undefined) {
    return Math.abs(To - From);
  } else {
    return 0;
  }
}

// Define a function to calculate totals for each column
const calculateColumnTotals = (agrodata) => {
  const columnTotals = {
    totalExp: 0,
    totalTrainBusFair: 0,
    totalTaxiAutoFair: 0,
    totalAirFair: 0,
    totalvehiclerepair: 0,
    totalHotelExp: 0,
    totalmobileinternet: 0,
    totalDAlocal: 0,
    totalDAOut: 0,
    totalExpStat: 0,
    totalexpMISC: 0,
    totalclaimedAmount: 0
  };

  agrodata.forEach(record => {
    columnTotals.totalExp += record['EXP_FUEL'] || 0;
    columnTotals.totalTrainBusFair += record['EXP_BUS_TRAIN'] || 0;
    columnTotals.totalTaxiAutoFair += record['EXP_TAXI_AUTO'] || 0;
    columnTotals.totalAirFair += record['EXP_PLANE'] || 0;
    columnTotals.totalvehiclerepair += record['EXP_VEH_REPAIR'] || 0;
    columnTotals.totalHotelExp += record['EXP_HOTEL'] || 0;
    columnTotals.totalmobileinternet += record['EXP_MOBILE_INTERNET'] || 0;
    columnTotals.totalDAlocal += record['DA_RATES_LOCAL'] || 0;
    columnTotals.totalDAOut += record['DA_RATES_OUTST'] || 0;
    columnTotals.totalExpStat += record['EXP_STATIONARY'] || 0;
    columnTotals.totalexpMISC += record['EXP_MISC'] || 0;
    columnTotals.totalclaimedAmount += record['TOTAL_CLAIMED_AMOUNT'] || 0;
  });

  return columnTotals;
};

// Define a function to calculate the grand total of the totalclaimedAmount column
const calculateGrandTotal = (agrodata) => {
  let grandTotal = 0;

  agrodata.forEach(record => {
    grandTotal += record['TOTAL_CLAIMED_AMOUNT'] || 0;
  });

  return grandTotal;
};

const bestAgro = async (req, res) => {
  try {
    const empId = req.query.id;
    if (!empId) {
      return res.status(400).send("Employee ID is required");
    }

    // Fetch data from the API endpoint using the provided empId
    const response = await fetch(`http://suprsales.io:5000/suprsales_api/Claim/getFormData?id=${empId}`);
    const agrodata = await response.json();

    // Calculate grand total of totalclaimedAmount
    const grandTotal = calculateGrandTotal(agrodata);
    const columnTotals = calculateColumnTotals(agrodata);
    const grandTotalInWords = numberToWords.toWords(grandTotal);

    // Extract unique employee information
    const employeeInfo = agrodata.length > 0 ? {
      EMP_NAME: agrodata[0].EMP_NAME,
      EMP_ID: agrodata[0].EMP_ID,
      EMP_DESG: agrodata[0].EMP_DESG
    } : {};

    // Function to format date
    function formatDate(dateString) {
      const options = { day: '2-digit', month: 'long', year: 'numeric' };
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', options);
      return formattedDate.replace(/(\d+)(\s\w+\s),\s(\d+)/, "$1$2, $3");
    }

 // Render HTML template with fetched data
 const htmlContent = await ejs.renderFile(path.join(__dirname, "../views/agro.ejs"), { 
  agrodata,
  formatDate,
  calculateTotalKm,
  calculateColumnTotals,
  columnTotals,
  grandTotal,
  grandTotalInWords,
  employeeInfo 
});
 // Launch Puppeteer and generate PDF
 const browser = await puppeteer.launch();
 const page = await browser.newPage();
 await page.setContent(htmlContent);
 const pdfBuffer = await page.pdf({ format: 'A2' });

 await browser.close();

 // Set headers to download the PDF
 res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
 res.setHeader('Content-Type', 'application/pdf');
 res.setHeader('Content-Length', pdfBuffer.length);

 // Send the PDF file as a response
 res.send(pdfBuffer);
} catch (error) {
 console.error("Error fetching data:", error);
 if (!res.headersSent) {
   res.status(500).send("Internal Server Error");
 }
}
};

module.exports = { bestAgro };
