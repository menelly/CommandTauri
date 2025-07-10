// Quick test to debug address parsing
const testText = `AdventHealth Medical Group Family Medicine at Daytona Beach
Directions to AdventHealth Medical Group Family Medicine at Daytona Beach305 Memorial Medical Pkwy
Suite 402
Daytona Beach, FL  32117
Call AdventHealth Medical Group Family Medicine at Daytona Beach at386-231-3525`;

console.log('Testing address patterns with actual text...\n');
console.log('Text to parse:');
console.log(testText);
console.log('\n---\n');

// Test each address pattern
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
  }
];

addressPatterns.forEach(pattern => {
  const match = testText.match(pattern.regex);
  console.log(`Pattern: ${pattern.name}`);
  if (match) {
    console.log(`✅ MATCH: "${match[1] || match[0]}"`);
  } else {
    console.log('❌ NO MATCH');
  }
  console.log('---');
});
