// Simple test to verify export functions work
import { exportToPDF, exportToExcel } from './lib/exportUtils.js';

// Test data
const testData = [
  { metric: 'Total Users', value: 150, category: 'Overview' },
  { metric: 'Total Patients', value: 85, category: 'Health' },
  { metric: 'Total Students', value: 45, category: 'Daycare' }
];

const columns = ['Metric', 'Value', 'Category'];

// Test PDF export
try {
  console.log('Testing PDF export...');
  exportToPDF(testData, 'Test Report', columns, 'test-report.pdf');
  console.log('✅ PDF export test passed');
} catch (error) {
  console.error('❌ PDF export test failed:', error);
}

// Test Excel export
try {
  console.log('Testing Excel export...');
  exportToExcel(testData, 'Test Report', 'test-report.xlsx');
  console.log('✅ Excel export test passed');
} catch (error) {
  console.error('❌ Excel export test failed:', error);
}