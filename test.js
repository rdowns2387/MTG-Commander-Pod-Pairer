const axios = require("axios");

// Base URL for API
const API_URL = "http://localhost:9000/api";

// Test user data
const testUser = {
  firstName: "Test",
  lastName: "User",
  email: `test${Date.now()}@example.com`,
  pin: "1234",
};

let token;

// Test registration
const testRegistration = async () => {
  try {
    console.log("Testing registration...");
    const res = await axios.post(`${API_URL}/auth/register`, testUser);
    token = res.data.token;
    console.log("Registration successful");
    return true;
  } catch (err) {
    console.error(
      "Registration failed:",
      err.response?.data?.message || err.message
    );
    return false;
  }
};

// Test login
const testLogin = async () => {
  try {
    console.log("Testing login...");
    const res = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      pin: testUser.pin,
    });
    token = res.data.token;
    console.log("Login successful");
    return true;
  } catch (err) {
    console.error("Login failed:", err.response?.data?.message || err.message);
    return false;
  }
};

// Test get current user
const testGetMe = async () => {
  try {
    console.log("Testing get current user...");
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Get current user successful");
    return true;
  } catch (err) {
    console.error(
      "Get current user failed:",
      err.response?.data?.message || err.message
    );
    return false;
  }
};

// Test join queue
const testJoinQueue = async () => {
  try {
    console.log("Testing join queue...");
    const res = await axios.put(
      `${API_URL}/queue/join`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Join queue successful");
    return true;
  } catch (err) {
    console.error(
      "Join queue failed:",
      err.response?.data?.message || err.message
    );
    return false;
  }
};

// Test get queue status
const testQueueStatus = async () => {
  try {
    console.log("Testing get queue status...");
    const res = await axios.get(`${API_URL}/queue/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Get queue status successful");
    return true;
  } catch (err) {
    console.error(
      "Get queue status failed:",
      err.response?.data?.message || err.message
    );
    return false;
  }
};

// Run tests
const runTests = async () => {
  console.log("Starting tests...");

  // Test registration
  if (!(await testRegistration())) {
    console.error("Tests failed at registration");
    return;
  }

  // Test login
  if (!(await testLogin())) {
    console.error("Tests failed at login");
    return;
  }

  // Test get current user
  if (!(await testGetMe())) {
    console.error("Tests failed at get current user");
    return;
  }

  // Test join queue
  if (!(await testJoinQueue())) {
    console.error("Tests failed at join queue");
    return;
  }

  // Test get queue status
  if (!(await testQueueStatus())) {
    console.error("Tests failed at get queue status");
    return;
  }

  console.log("All tests passed!");
};

// Run tests when script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
};
