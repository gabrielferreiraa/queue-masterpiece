
import React, { useState } from 'react';
import { PlusCircle, ListOrdered, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueueItem } from '@/components/QueueItem';
import { useQueueStore } from '@/store/queueStore';
import { useQueueWorker } from '@/hooks/useQueueWorker';
import { toast } from 'sonner';

export const QueueManager = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const { 
    queue, 
    processingTask, 
    completedTasks, 
    isProcessing,
    addTask, 
    clearCompletedTasks 
  } = useQueueStore();
  
  // Initialize the web worker
  useQueueWorker();
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    } else {
      toast.error('Please enter a task title');
    }
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Task Queue Manager</h1>
        <p className="text-muted-foreground">
          Add tasks to the queue and watch them process sequentially.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
          <CardDescription>
            Create a new task that will be added to the processing queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl">Queue</CardTitle>
              <CardDescription>
                Tasks waiting to be processed ({queue.length})
              </CardDescription>
            </div>
            {isProcessing && (
              <div className="flex items-center text-primary text-sm font-medium">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {processingTask && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Currently Processing:</h3>
                <QueueItem task={processingTask} showControls={false} />
              </div>
            )}
            
            {queue.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Up Next:</h3>
                {queue.map((task) => (
                  <QueueItem key={task.id} task={task} />
                ))}
              </div>
            ) : !processingTask ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ListOrdered className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Queue is empty. Add a new task to get started.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl">Completed Tasks</CardTitle>
              <CardDescription>
                Tasks that have been processed ({completedTasks.length})
              </CardDescription>
            </div>
            {completedTasks.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearCompletedTasks}
              >
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {completedTasks.length > 0 ? (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="success">Success</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-3 mt-0">
                  {completedTasks.map((task) => (
                    <QueueItem key={task.id} task={task} />
                  ))}
                </TabsContent>
                
                <TabsContent value="success" className="space-y-3 mt-0">
                  {completedTasks
                    .filter(task => task.status === 'completed')
                    .map((task) => (
                      <QueueItem key={task.id} task={task} />
                    ))}
                </TabsContent>
                
                <TabsContent value="failed" className="space-y-3 mt-0">
                  {completedTasks
                    .filter(task => task.status === 'failed')
                    .map((task) => (
                      <QueueItem key={task.id} task={task} />
                    ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed tasks yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
