const { createPods, handlePodTimeouts } = require('./podAssignmentService');

// Function to run pod assignment
const runPodAssignment = async () => {
  console.log('Running pod assignment...');
  try {
    const result = await createPods();
    console.log(`Pod assignment result: ${result.message}`);
    return result;
  } catch (error) {
    console.error('Error in pod assignment:', error);
    return {
      success: false,
      message: 'Error in pod assignment',
      error: error.message
    };
  }
};

// Function to check for pod timeouts
const checkPodTimeouts = async () => {
  console.log('Checking pod timeouts...');
  try {
    const result = await handlePodTimeouts();
    console.log(`Pod timeout check result: ${result.message}`);
    return result;
  } catch (error) {
    console.error('Error checking pod timeouts:', error);
    return {
      success: false,
      message: 'Error checking pod timeouts',
      error: error.message
    };
  }
};

// Initialize cron jobs
const initCronJobs = () => {
  // Check for pod timeouts every minute
  setInterval(checkPodTimeouts, 60 * 1000);
  
  // Try to create pods every 30 seconds
  setInterval(runPodAssignment, 30 * 1000);
  
  console.log('Cron jobs initialized');
};

module.exports = {
  initCronJobs,
  runPodAssignment,
  checkPodTimeouts
};