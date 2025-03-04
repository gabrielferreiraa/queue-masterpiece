
import { create } from 'zustand';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  createdAt: Date;
  completedAt?: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  processingTime?: number;
}

interface QueueState {
  queue: Task[];
  processingTask: Task | null;
  completedTasks: Task[];
  isProcessing: boolean;
  addTask: (title: string) => void;
  startProcessing: (taskId?: string) => void;
  completeTask: (taskId: string, result: string, processingTime: number) => void;
  failTask: (taskId: string, error: string) => void;
  resetTask: (taskId: string) => void;
  clearCompletedTasks: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  processingTask: null,
  completedTasks: [],
  isProcessing: false,

  addTask: (title) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date(),
      status: 'queued',
    };

    set((state) => ({
      queue: [...state.queue, newTask],
    }));

    toast.success('Task added to queue');

    // Auto-start processing if no task is currently processing
    const { isProcessing } = get();
    if (!isProcessing) {
      setTimeout(() => {
        get().startProcessing();
      }, 100);
    }
  },

  startProcessing: (taskId) => {
    const { queue, processingTask } = get();

    // If already processing, don't start another
    if (processingTask) return;

    // If specific taskId is provided, prioritize it
    let nextTask: Task | undefined;
    let remainingQueue: Task[] = [];

    if (taskId) {
      nextTask = queue.find((task) => task.id === taskId);
      remainingQueue = queue.filter((task) => task.id !== taskId);
    } else if (queue.length > 0) {
      // Take the first task in queue by default
      [nextTask, ...remainingQueue] = queue;
    }

    if (nextTask) {
      const processingTask = {
        ...nextTask,
        status: 'processing' as const,
      };

      set({
        queue: remainingQueue,
        processingTask,
        isProcessing: true,
      });

      toast.info(`Processing task: ${processingTask.title}`);
    }
  },

  completeTask: (taskId, result, processingTime) => {
    const { processingTask } = get();
    
    if (processingTask && processingTask.id === taskId) {
      const completedTask: Task = {
        ...processingTask,
        status: 'completed',
        completedAt: new Date(),
        result,
        processingTime,
      };

      set((state) => ({
        processingTask: null,
        completedTasks: [completedTask, ...state.completedTasks],
        isProcessing: false,
      }));

      toast.success(`Task completed: ${completedTask.title}`);

      // Start next task if there are more in queue
      setTimeout(() => {
        const { queue } = get();
        if (queue.length > 0) {
          get().startProcessing();
        }
      }, 500);
    }
  },

  failTask: (taskId, error) => {
    const { processingTask } = get();
    
    if (processingTask && processingTask.id === taskId) {
      const failedTask: Task = {
        ...processingTask,
        status: 'failed',
        error,
      };

      set((state) => ({
        processingTask: null,
        completedTasks: [failedTask, ...state.completedTasks],
        isProcessing: false,
      }));

      toast.error(`Task failed: ${failedTask.title}`);

      // Start next task if there are more in queue
      setTimeout(() => {
        const { queue } = get();
        if (queue.length > 0) {
          get().startProcessing();
        }
      }, 500);
    }
  },

  resetTask: (taskId) => {
    const { completedTasks } = get();
    const taskToReset = completedTasks.find(task => task.id === taskId);
    
    if (taskToReset) {
      const resetTask: Task = {
        ...taskToReset,
        status: 'queued',
        completedAt: undefined,
        result: undefined,
        error: undefined,
      };

      set((state) => ({
        completedTasks: state.completedTasks.filter(task => task.id !== taskId),
        queue: [...state.queue, resetTask],
      }));

      toast.info(`Task reset: ${resetTask.title}`);
    }
  },

  clearCompletedTasks: () => {
    set({ completedTasks: [] });
    toast.info('Completed tasks cleared');
  },
}));
