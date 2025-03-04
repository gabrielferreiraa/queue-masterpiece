
// This file will be imported as a string and used to create a Blob URL
export const taskWorkerScript = `
self.onmessage = function(e) {
  const { taskId, type } = e.data;
  
  if (type === 'PROCESS_TASK') {
    // Simulate processing time between 2-5 seconds
    const processingTime = Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;
    
    setTimeout(() => {
      // 10% chance of task failure for error demonstration
      const success = Math.random() > 0.1;
      
      if (success) {
        self.postMessage({ 
          type: 'TASK_COMPLETED', 
          taskId, 
          result: 'Task processed successfully',
          processingTime 
        });
      } else {
        self.postMessage({ 
          type: 'TASK_FAILED', 
          taskId, 
          error: 'Random processing error occurred',
          processingTime 
        });
      }
    }, processingTime);
  }
};
`;
