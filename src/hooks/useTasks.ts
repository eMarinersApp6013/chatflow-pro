// useTasks — CRUD for daily checklist tasks stored in WatermelonDB.
import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { tasksCollection, database } from '../db/database';
import TaskModel from '../db/models/TaskModel';

export function useTasks() {
  const [tasks, setTasks] = useState<TaskModel[]>([]);

  useEffect(() => {
    const subscription = tasksCollection
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe({
        next: (records) => setTasks(records as TaskModel[]),
        error: (err) => console.error('[useTasks] error:', err),
      });
    return () => subscription.unsubscribe();
  }, []);

  const addTask = async (title: string, priority: string = 'medium') => {
    await database.write(async () => {
      await tasksCollection.create((t) => {
        t.title = title;
        t.isCompleted = false;
        t.priority = priority;
        t.createdAt = Math.floor(Date.now() / 1000);
      });
    });
  };

  const toggleTask = async (task: TaskModel) => {
    await database.write(async () => {
      await task.update((t) => {
        t.isCompleted = !t.isCompleted;
      });
    });
  };

  const deleteTask = async (task: TaskModel) => {
    await database.write(async () => {
      await task.markAsDeleted();
    });
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;

  return { tasks, addTask, toggleTask, deleteTask, completedCount, totalCount };
}
