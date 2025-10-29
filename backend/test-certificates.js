// Simple test script to verify certificate endpoints work
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
  daycare: {
    studentId: 'sample-student-id',
    certificateType: 'COMPLETION',
    certificateNumber: 'DC-2024-001',
    purpose: 'Daycare Program Completion',
    achievements: 'Successfully completed early childhood development program',
    recommendations: 'Ready for kindergarten',
    issuedBy: 'sample-teacher-id'
  },
  sk: {
    eventId: 'sample-event-id',
    userId: 'sample-user-id',
    certificateType: 'PARTICIPATION',
    certificateNumber: 'SK-2024-001',
    purpose: 'Event Participation',
    achievements: 'Active participation in community event',
    recommendations: 'Continue community involvement',
    issuedBy: 'sample-sk-chairman-id'
  }
};

async function testEndpoints() {
  try {
    console.log('Testing certificate endpoints...');
    
    // Test GET endpoints (should work without auth for testing)
    console.log('\n1. Testing GET /api/daycare/certificates');
    try {
      const daycareResponse = await axios.get(`${BASE_URL}/daycare/certificates`);
      console.log('✅ Daycare certificates endpoint accessible');
      console.log('Response:', daycareResponse.data);
    } catch (error) {
      console.log('❌ Daycare certificates GET failed:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n2. Testing GET /api/sk/certificates');
    try {
      const skResponse = await axios.get(`${BASE_URL}/sk/certificates`);
      console.log('✅ SK certificates endpoint accessible');
      console.log('Response:', skResponse.data);
    } catch (error) {
      console.log('❌ SK certificates GET failed:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n3. Testing GET /api/sk/events');
    try {
      const eventsResponse = await axios.get(`${BASE_URL}/sk/events`);
      console.log('✅ SK events endpoint accessible');
      console.log('Response:', eventsResponse.data);
    } catch (error) {
      console.log('❌ SK events GET failed:', error.response?.status, error.response?.data?.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testEndpoints();