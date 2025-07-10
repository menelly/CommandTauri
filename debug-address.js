// Quick debug test for address parsing
const testText = `Vola H Le Roux, FNP-C
    
     4.8stars rating (450reviews)View ratings and comments for Vola H Le Roux, FNP-C
Family Medicine

 AdventHealth Medical Group
Provider Networks
 Accepts New Patients

Download Contact Information
Tabbed links for navigating sub-sections5 items. To interact with these items, press Control-Option-Shift-Right Arrow
Item 1 of 5
Book an appointment
 Item 3 of 5
Locations
 Item 4 of 5
Expertise
 Item 5 of 5
Reviews and Comments
Locationsfor Vola H Le Roux, FNP-C
A- Daytona Beach

View Map
Map pinA
Daytona Beach
2.4 miles away
AdventHealth Medical Group Family Medicine at Daytona Beach
Directions to AdventHealth Medical Group Family Medicine at Daytona Beach305 Memorial Medical Pkwy
Suite 402
Daytona Beach, FL  32117
Call AdventHealth Medical Group Family Medicine at Daytona Beach at386-231-3525`;

// Test the address patterns
const addressPatterns = [
  {
    name: 'address_street_suite_city',
    regex: /([0-9]+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Parkway|Pkwy)\s+Suite\s+[0-9A-Za-z]+\s+[A-Za-z\s]+,\s*[A-Z]{2}\s+[0-9]{5})/i
  },
  {
    name: 'address_with_suite',
    regex: /([0-9]+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Parkway|Pkwy)(?:\s+Suite\s+[0-9A-Za-z]+)?(?:\s+[A-Za-z\s]+,\s*[A-Z]{2}\s+[0-9]{5}(?:-[0-9]{4})?)?)/i
  },
  {
    name: 'address_full',
    regex: /(?:Directions to|Address:?)?\s*([0-9]+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Boulevard|Blvd|Drive|Dr|Lane|Ln|Road|Rd|Parkway|Pkwy|Suite|Ste|Unit)[\s,]*[A-Za-z0-9\s,-]*)/i
  },
  {
    name: 'simple_address',
    regex: /(305 Memorial Medical Pkwy[\s\S]*?Suite 402[\s\S]*?Daytona Beach, FL\s+32117)/i
  }
];

console.log('Testing address patterns...\n');

addressPatterns.forEach(pattern => {
  const match = testText.match(pattern.regex);
  console.log(`Pattern: ${pattern.name}`);
  console.log(`Match: ${match ? match[1] || match[0] : 'NO MATCH'}`);
  console.log('---');
});
