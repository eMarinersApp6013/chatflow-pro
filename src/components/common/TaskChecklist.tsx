// Daily Checklist widget — shown at the top of the Chats tab.
// Collapsible section showing tasks with add/complete/delete.

import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { CheckSquare, Square, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useUIStore } from '../../store/uiStore';
import { useTasks } from '../../hooks/useTasks';
import TaskModel from '../../db/models/TaskModel';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#ea4335',
  medium: '#f59e0b',
  low: '#22c55e',
};

export function TaskChecklist() {
  const { colors } = useUIStore();
  const { tasks, addTask, toggleTask, deleteTask, completedCount, totalCount } = useTasks();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  const handleAdd = useCallback(() => {
    const text = newTaskText.trim();
    if (!text) return;
    addTask(text);
    setNewTaskText('');
  }, [newTaskText, addTask]);

  // Show nothing if no tasks and collapsed
  if (totalCount === 0 && !isExpanded) {
    return (
      <TouchableOpacity
        style={[styles.collapsedBar, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setIsExpanded(true)}
      >
        <CheckSquare color={colors.green} size={16} />
        <Text style={[styles.collapsedText, { color: colors.textDim }]}>Daily Checklist</Text>
        <Plus color={colors.textDim2} size={16} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header row */}
      <TouchableOpacity style={styles.headerRow} onPress={() => setIsExpanded(!isExpanded)}>
        <CheckSquare color={colors.green} size={16} />
        <Text style={[styles.title, { color: colors.text }]}>Daily Checklist</Text>
        {totalCount > 0 && (
          <Text style={[styles.counter, { color: colors.textDim }]}>
            {completedCount}/{totalCount}
          </Text>
        )}
        {isExpanded ? (
          <ChevronUp color={colors.textDim} size={16} />
        ) : (
          <ChevronDown color={colors.textDim} size={16} />
        )}
      </TouchableOpacity>

      {/* Progress bar */}
      {totalCount > 0 && (
        <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.green,
                width: `${(completedCount / totalCount) * 100}%`,
              },
            ]}
          />
        </View>
      )}

      {isExpanded && (
        <>
          {/* Task list */}
          {tasks.map((task: TaskModel) => (
            <View key={task.id} style={styles.taskRow}>
              <TouchableOpacity onPress={() => toggleTask(task)} style={styles.checkBtn}>
                {task.isCompleted ? (
                  <CheckSquare color={colors.green} size={18} />
                ) : (
                  <Square color={colors.textDim2} size={18} />
                )}
              </TouchableOpacity>
              <View
                style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] ?? colors.textDim }]}
              />
              <Text
                style={[
                  styles.taskText,
                  { color: task.isCompleted ? colors.textDim2 : colors.text },
                  task.isCompleted && styles.strikethrough,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              <TouchableOpacity onPress={() => deleteTask(task)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Trash2 color={colors.textDim2} size={14} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add task input */}
          <View style={[styles.addRow, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.addInput, { color: colors.text }]}
              placeholder="Add a task..."
              placeholderTextColor={colors.textDim2}
              value={newTaskText}
              onChangeText={setNewTaskText}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={handleAdd}>
              <Plus color={colors.green} size={20} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 12, marginTop: 8, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  collapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  collapsedText: { flex: 1, fontSize: 13, fontWeight: '500' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  title: { flex: 1, fontSize: 13, fontWeight: '600' },
  counter: { fontSize: 11, fontWeight: '600' },
  progressBg: { height: 3, marginHorizontal: 14 },
  progressFill: { height: 3, borderRadius: 2 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, gap: 8 },
  checkBtn: { padding: 2 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  taskText: { flex: 1, fontSize: 13 },
  strikethrough: { textDecorationLine: 'line-through' },
  addRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 1, gap: 8 },
  addInput: { flex: 1, fontSize: 13, padding: 0 },
});
