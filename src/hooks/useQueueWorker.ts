
import { useRef, useEffect } from 'react';
import { useQueueStore } from '../store/queueStore';
import { taskWorkerScript } from '../workers/taskWorker';

export function useQueueWorker() {
  const worker = useRef<Worker | null>(null);
  const { processingTask, completeTask, failTask } = useQueueStore();

  useEffect(() => {
    // Create a Blob URL from our worker script
    const blob = new Blob([taskWorkerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    
    // Create the worker
    worker.current = new Worker(url);
    
    // Set up event listener for messages from the worker
    worker.current.onmessage = (e) => {
      const { type, taskId, result, error, processingTime } = e.data;
      
      if (type === 'TASK_COMPLETED') {
        completeTask(taskId, result, processingTime);
      } else if (type === 'TASK_FAILED') {
        failTask(taskId, error);
      }
    };
    
    // Set up error handler
    worker.current.onerror = (error) => {
      console.error('Worker error:', error);
      if (processingTask) {
        failTask(processingTask.id, 'Worker error: ' + error.message);
      }
    };
    
    // Clean up when unmounting
    return () => {
      if (worker.current) {
        worker.current.terminate();
      }
      URL.revokeObjectURL(url);
    };
  }, [completeTask, failTask, processingTask]);
  
  // Function to send a task to the worker for processing
  const processTask = (taskId: string) => {
    if (worker.current) {
      worker.current.postMessage({ type: 'PROCESS_TASK', taskId });
    }
  };
  
  // Automatically process any task that's in the processing state
  useEffect(() => {
    if (processingTask) {
      processTask(processingTask.id);
    }
  }, [processingTask]);
  
  return { processTask };
}
