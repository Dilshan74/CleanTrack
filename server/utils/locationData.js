const LOCATION_DATA = {
  "Western Province": {
    "Colombo": [
      { city: "Colombo 01 (Fort)", postalCode: "00100" },
      { city: "Colombo 02 (Slave Island)", postalCode: "00200" },
      { city: "Colombo 03 (Colpetty)", postalCode: "00300" },
      { city: "Colombo 04 (Bambalapitiya)", postalCode: "00400" },
      { city: "Colombo 05 (Havelock Town / Kirulapone)", postalCode: "00500" },
      { city: "Colombo 06 (Wellawatte)", postalCode: "00600" },
      { city: "Colombo 07 (Cinnamon Gardens)", postalCode: "00700" },
      { city: "Colombo 08 (Borella)", postalCode: "00800" },
      { city: "Colombo 09 (Dematagoda)", postalCode: "00900" },
      { city: "Colombo 10 (Maradana / Panchikawatte)", postalCode: "01000" },
      { city: "Sri Jayawardenepura Kotte", postalCode: "10100" },
      { city: "Rajagiriya", postalCode: "10107" },
      { city: "Malabe", postalCode: "10115" },
      { city: "Battaramulla", postalCode: "10120" },
      { city: "Athurugiriya", postalCode: "10150" },
      { city: "Homagama", postalCode: "10200" },
      { city: "Nugegoda", postalCode: "10250" },
      { city: "Maharagama", postalCode: "10280" },
      { city: "Boralesgamuwa", postalCode: "10290" },
      { city: "Piliyandala", postalCode: "10300" },
      { city: "Dehiwala", postalCode: "10350" },
      { city: "Mount Lavinia", postalCode: "10370" },
      { city: "Moratuwa", postalCode: "10400" }
    ],
    "Gampaha": [
      { city: "Gampaha", postalCode: "11000" },
      { city: "Ragama", postalCode: "11010" },
      { city: "Wattala", postalCode: "11300" },
      { city: "Katunayake", postalCode: "11450" },
      { city: "Negombo", postalCode: "11500" },
      { city: "Kelaniya", postalCode: "11600" }
    ],
    "Kalutara": [
      { city: "Kalutara", postalCode: "12000" },
      { city: "Beruwala", postalCode: "12070" },
      { city: "Matugama", postalCode: "12100" },
      { city: "Horana", postalCode: "12400" },
      { city: "Panadura", postalCode: "12500" }
    ]
  },
  "Central Province": {
    "Kandy": [
      { city: "Kandy (General)", postalCode: "20000" },
      { city: "Ampitiya", postalCode: "20160" },
      { city: "Peradeniya", postalCode: "20400" },
      { city: "Gampola", postalCode: "20500" }
    ],
    "Matale": [
      { city: "Matale", postalCode: "21000" },
      { city: "Dambulla", postalCode: "21100" }
    ],
    "Nuwara Eliya": [
      { city: "Nuwara Eliya", postalCode: "22200" },
      { city: "Hatton", postalCode: "22000" }
    ]
  },
  "Southern Province": {
    "Galle": [
      { city: "Galle (Fort / Central)", postalCode: "80000" },
      { city: "Hikkaduwa", postalCode: "80240" },
      { city: "Ambalangoda", postalCode: "80300" }
    ],
    "Matara": [
      { city: "Matara", postalCode: "81000" },
      { city: "Weligama", postalCode: "81700" }
    ],
    "Hambantota": [
      { city: "Hambantota", postalCode: "82000" },
      { city: "Tangalle", postalCode: "82200" }
    ]
  },
  "Northern Province": {
    "Jaffna": [
      { city: "Jaffna", postalCode: "40000" },
      { city: "Chavakachcheri", postalCode: "40600" }
    ],
    "Mannar": [
      { city: "Mannar", postalCode: "41000" }
    ],
    "Kilinochchi": [
      { city: "Kilinochchi", postalCode: "42000" }
    ],
    "Vavuniya": [
      { city: "Vavuniya", postalCode: "43000" }
    ]
  },
  "Eastern Province": {
    "Batticaloa": [
      { city: "Batticaloa", postalCode: "30000" }
    ],
    "Trincomalee": [
      { city: "Trincomalee", postalCode: "31000" }
    ],
    "Ampara": [
      { city: "Ampara", postalCode: "32000" },
      { city: "Kalmunai", postalCode: "32300" }
    ]
  },
  "North Western Province": {
    "Kurunegala": [
      { city: "Kurunegala", postalCode: "60000" }
    ],
    "Puttalam": [
      { city: "Chilaw", postalCode: "61000" },
      { city: "Wennappuwa", postalCode: "61170" },
      { city: "Puttalam", postalCode: "61300" }
    ]
  },
  "North Central Province": {
    "Anuradhapura": [
      { city: "Anuradhapura", postalCode: "50000" }
    ],
    "Polonnaruwa": [
      { city: "Polonnaruwa", postalCode: "51000" }
    ]
  },
  "Uva Province": {
    "Badulla": [
      { city: "Badulla", postalCode: "90000" },
      { city: "Bandarawela", postalCode: "90100" }
    ],
    "Monaragala": [
      { city: "Monaragala", postalCode: "91000" }
    ]
  },
  "Sabaragamuwa Province": {
    "Ratnapura": [
      { city: "Ratnapura", postalCode: "70000" }
    ],
    "Kegalle": [
      { city: "Kegalle", postalCode: "71000" }
    ]
  }
};

/**
 * Validates if the given combination of province, district, city, and postalCode is valid.
 */
function isValidLocation(province, district, city, postalCode) {
  const pData = LOCATION_DATA[province];
  if (!pData) return false;
  
  const dData = pData[district];
  if (!dData) return false;
  
  const cityObj = dData.find(c => c.city === city);
  if (!cityObj) return false;
  
  if (postalCode && cityObj.postalCode !== postalCode) return false;
  
  return true;
}

function getPostalCodeForCity(province, district, city) {
  const pData = LOCATION_DATA[province];
  if (!pData) return null;
  const dData = pData[district];
  if (!dData) return null;
  const cityObj = dData.find(c => c.city === city);
  return cityObj ? cityObj.postalCode : null;
}

module.exports = {
  LOCATION_DATA,
  isValidLocation,
  getPostalCodeForCity
};
