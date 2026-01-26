const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, '../data/Families_angiosperms.csv');
const jsonOutputPath = path.join(__dirname, '../src/data/plantFamilies.json');

function parseCSV(csvText) {
  const lines = [];
  let currentLine = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\r' || char === '\n') {
        if (currentField || currentLine.length > 0) {
          currentLine.push(currentField.trim());
          lines.push(currentLine);
          currentLine = [];
          currentField = '';
        }
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || currentLine.length > 0) {
    currentLine.push(currentField.trim());
    lines.push(currentLine);
  }

  const header = lines[0];
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (row.length < header.length) continue;

    const entry = {};
    header.forEach((col, index) => {
      entry[col] = row[index] || '';
    });

    if (!entry['科拉丁名']) continue;

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
