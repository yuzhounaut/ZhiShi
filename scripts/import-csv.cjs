const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../data/Families_angiosperms.csv');
const jsonOutputPath = path.join(__dirname, '../src/data/plantFamilies.json');

function parseCSV(csvText) {
  // Simple CSV parser that handles basic comma separation
  // Assumes no commas within the fields themselves (they use Chinese commas "，" or "、")
  const lines = csvText.trim().split(/\r?\n/);
  const header = lines[0].split(',');

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    const entry = {};

    header.forEach((col, index) => {
      entry[col] = values[index] ? values[index].trim() : '';
    });

    // Map to our desired structure
    const mappedEntry = {
      id: entry['科拉丁名'].toLowerCase().replace(/[^a-z0-9]/g, ''),
      sequenceNumber: parseInt(entry['序号']),
      category: parseInt(entry['类群']),
      chineseName: entry['科中文名'],
      sourceType: entry['药典/地方'],
      familyOrder: parseInt(entry['科序']),
      latinName: entry['科拉丁名'],
      memoryModule: entry['科特征记忆模块'],
      identificationModule: entry['未知科检索模块']
    };

    results.push(mappedEntry);
  }
  return results;
}

try {
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const jsonData = parseCSV(csvData);

  fs.writeFileSync(jsonOutputPath, JSON.stringify(jsonData, null, 2), 'utf8');
  console.log(`Successfully imported ${jsonData.length} families to ${jsonOutputPath}`);
} catch (error) {
  console.error('Error importing CSV:', error);
  process.exit(1);
}
