const assert = require('assert');

function cleanMarkdownTables(markdown) {
  const lines = markdown.split(/\r?\n/);
  const cleanedLines = [];
  let inTable = false;
  let currentTableRow = '';
  let expectedPipes = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Isolated pipe line e.g., " |" or "|"
    const isIsolatedPipe = /^\s*\|\s*$/.test(line);

    if (isIsolatedPipe && inTable) {
      if (currentTableRow) {
        if (!currentTableRow.trim().endsWith('|')) {
          currentTableRow += ' |';
        }
        cleanedLines.push(currentTableRow);
        currentTableRow = '';
      }
      continue;
    }

    if (trimmed.startsWith('|')) {
      inTable = true;
      if (!currentTableRow) {
        currentTableRow = trimmed;
        const pipeCount = (trimmed.match(/\|/g) || []).length;
        if (pipeCount > expectedPipes) {
          expectedPipes = pipeCount;
        }
      } else {
        const currentPipes = (currentTableRow.match(/\|/g) || []).length;
        if (!currentTableRow.endsWith('|') || (expectedPipes > 2 && currentPipes < expectedPipes && !trimmed.startsWith('| ---'))) {
          currentTableRow += ' ' + trimmed;
        } else {
          cleanedLines.push(currentTableRow);
          currentTableRow = trimmed;
          const pipeCount = (trimmed.match(/\|/g) || []).length;
          if (pipeCount > expectedPipes) {
            expectedPipes = pipeCount;
          }
        }
      }
      continue;
    }

    if (inTable && currentTableRow && trimmed.length > 0) {
      currentTableRow += ' ' + trimmed;
      continue;
    }

    if (trimmed === '') {
      if (inTable && currentTableRow) {
        let nextIndex = i + 1;
        while (nextIndex < lines.length && lines[nextIndex].trim() === '') {
          nextIndex++;
        }
        if (nextIndex < lines.length && /^\s*\|/.test(lines[nextIndex])) {
          continue;
        } else {
          cleanedLines.push(currentTableRow);
          currentTableRow = '';
          inTable = false;
          expectedPipes = 0;
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    } else {
      if (inTable) {
        cleanedLines.push(currentTableRow);
        currentTableRow = '';
        inTable = false;
        expectedPipes = 0;
      }
      cleanedLines.push(line);
    }
  }

  if (currentTableRow) {
    cleanedLines.push(currentTableRow);
  }

  return cleanedLines.join('\n');
}

function runTests() {
  console.log('Running Table Preprocessing Tests...');

  // Test 1: Remove stray blank lines with isolated pipe characters
  const input1 = `
| Gate Level | Stage | Required Approval |
| --- | --- | --- |
| **Gate 1** | Planning | Human lead.

 |
| **Gate 2** | Verification | Automated tests.

 |
`;
  const expected1 = `
| Gate Level | Stage | Required Approval |
| --- | --- | --- |
| **Gate 1** | Planning | Human lead. |
| **Gate 2** | Verification | Automated tests. |
`;

  const output1 = cleanMarkdownTables(input1);
  assert.strictEqual(output1.trim(), expected1.trim(), 'Test 1 Failed: Stray blank lines with isolated pipes not cleaned');
  console.log('✔ Test 1 Passed: Stray pipe lines removed');

  // Test 2: Multiline table row joining
  const input2 = `
| **Epic** | Strategic direction
 | Risk, Priority
 | High-level impact
 |
| **Feature** | Component scoping
 | Story Points
 | Technical boundaries
 |
`;
  const expected2 = `
| **Epic** | Strategic direction | Risk, Priority | High-level impact |
| **Feature** | Component scoping | Story Points | Technical boundaries |
`;

  const output2 = cleanMarkdownTables(input2);
  assert.strictEqual(output2.trim(), expected2.trim(), 'Test 2 Failed: Multiline table rows not merged correctly');
  console.log('✔ Test 2 Passed: Multiline table rows merged correctly');

  console.log('\nAll tests passed successfully!');
}

try {
  runTests();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
