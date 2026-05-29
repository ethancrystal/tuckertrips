// Simple API test runner for Tucker Trips
// Run with: node test-api.js

const axios = require('axios');

// Configuration - update with your local or deployed URL
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User'
};

const testTrip = {
  title: 'Test Trip to Paris',
  destination: 'Paris, France',
  status: 'future',
  visibility: 'private',
  description: 'A wonderful test trip'
};

let authToken = null;
let userId = null;
let createdTripId = null;

// Helper function for colored output
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m%s\x1b[0m',
    success: '\x1b[32m%s\x1b[0m',
    error: '\x1b[31m%s\x1b[0m',
    warning: '\x1b[33m%s\x1b[0m'
  };
  console.log(colors[type] || colors.info, `${new Date().toISOString()} - ${message}`);
};

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/me`);
    log('❌ Health check failed - should be unauthorized without token', 'error');
  } catch (error) {
    if (error.response?.status === 401) {
      log('✅ Health check passed - unauthorized without token', 'success');
    } else {
      log('⚠️ Health check returned unexpected error', 'warning');
    }
  }
}

async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/register`, testUser);

    if (response.data.user && response.data.token) {
      authToken = response.data.token;
      userId = response.data.user.id;
      log('✅ User registration successful', 'success');
      return true;
    }
  } catch (error) {
    log(`❌ Registration failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function testUserLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });

    if (response.data.user && response.data.token) {
      authToken = response.data.token;
      log('✅ User login successful', 'success');
      return true;
    }
  } catch (error) {
    log(`❌ Login failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function testCreateTrip() {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/trips`,
      testTrip,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.id) {
      createdTripId = response.data.id;
      log(`✅ Trip creation successful - ID: ${createdTripId}`, 'success');
      return true;
    }
  } catch (error) {
    log(`❌ Trip creation failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function testGetUserTrips() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/trips`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      const userTrip = response.data.find(t => t.id === createdTripId);
      if (userTrip) {
        log('✅ User trips retrieved successfully', 'success');
        return true;
      }
    }
    log('⚠️ Trips retrieved but created trip not found', 'warning');
  } catch (error) {
    log(`❌ Get trips failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function testUpdateTripVisibility() {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/trips/${createdTripId}`,
      { visibility: 'public', is_shared: true },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.visibility === 'public' && response.data.is_shared === true) {
      log('✅ Trip visibility updated to public and shared', 'success');
      return true;
    }
  } catch (error) {
    log(`❌ Trip update failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function testDeleteTrip() {
  try {
    await axios.delete(
      `${BASE_URL}/api/trips/${createdTripId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    log('✅ Trip deletion successful', 'success');
    return true;
  } catch (error) {
    log(`❌ Trip deletion failed: ${error.response?.data?.error || error.message}`, 'error');
  }
  return false;
}

async function runTests() {
  log('\n🚀 Starting Tucker Trips API Tests\n', 'info');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Create Trip', fn: testCreateTrip },
    { name: 'Get User Trips', fn: testGetUserTrips },
    { name: 'Update Trip Visibility', fn: testUpdateTripVisibility },
    { name: 'Delete Trip', fn: testDeleteTrip }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`\n📝 Running: ${test.name}`, 'info');
    const result = await test.fn();
    if (result) passed++;
    else failed++;
  }

  log('\n📊 Test Results:', 'info');
  log(`✅ Passed: ${passed}`, 'success');
  log(`❌ Failed: ${failed}`, 'error');
  log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`,
      passed === tests.length ? 'success' : 'warning');

  if (failed > 0) {
    log('\n⚠️ Some tests failed. Please review the errors above.', 'warning');
    process.exit(1);
  } else {
    log('\n🎉 All tests passed! The API is working correctly.', 'success');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    log(`\n💥 Test runner crashed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testCreateTrip,
  testGetUserTrips,
  testUpdateTripVisibility,
  testDeleteTrip
};