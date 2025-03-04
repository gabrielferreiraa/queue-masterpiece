
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Clock, PlayCircle, RotateCcw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, useQueueStore } from '@/store/queueStore';
import { Button } from '@/components/ui/button';

interface QueueItemProps {
  task: Task;
  showControls?: boolean;
}

export const QueueItem = ({ task, showControls = true }: QueueItemProps) => {
  const { startProcessing, resetTask } = useQueueStore();

  const handleStartProcessing = () => {
    startProcessing(task.id);
  };

  const handleReset = () => {
    resetTask(task.id);
  };

  return (
    <div 
      className={cn(
        'task-item animate-scale-in',
        task.status === 'processing' && 'task-item-processing',
        task.status === 'completed' && 'task-item-completed',
        task.status === 'failed' && 'border-destructive/30'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{task.title}</span>
            {task.status === 'processing' && (
              <span className="bg-primary/10 text-primary time-badge animate-pulse-subtle">
                Processing...
              </span>
            )}
            {task.status === 'completed' && (
              <span className="bg-success/10 text-success time-badge">
                Completed
              </span>
            )}
            {task.status === 'failed' && (
              <span className="bg-destructive/10 text-destructive time-badge">
                Failed
              </span>
            )}
          </div>
          
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">
              {task.completedAt 
                ? `Completed ${formatDistanceToNow(task.completedAt, { addSuffix: true })}`
                : `Created ${formatDistanceToNow(task.createdAt, { addSuffix: true })}`
              }
            </span>
          </div>

          {task.processingTime && (
            <div className="mt-1 text-xs text-muted-foreground">
              Processed in {(task.processingTime / 1000).toFixed(1)}s
            </div>
          )}
          
          {task.result && (
            <div className="mt-2 text-xs font-medium text-success">
              {task.result}
            </div>
          )}
          
          {task.error && (
            <div className="mt-2 text-xs font-medium text-destructive">
              {task.error}
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex flex-shrink-0 items-center">
            {task.status === 'queued' && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleStartProcessing}
                className="text-primary hover:text-primary/80"
              >
                <PlayCircle className="h-5 w-5" />
                <span className="sr-only">Start processing</span>
              </Button>
            )}
            
            {task.status === 'processing' && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            
            {(task.status === 'completed' || task.status === 'failed') && (
              <Button
                variant="ghost" 
                size="icon" 
                onClick={handleReset}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="sr-only">Reset task</span>
              </Button>
            )}
            
            {task.status === 'completed' && (
              <CheckCircle className="h-5 w-5 ml-1 text-success" />
            )}
            
            {task.status === 'failed' && (
              <XCircle className="h-5 w-5 ml-1 text-destructive" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
