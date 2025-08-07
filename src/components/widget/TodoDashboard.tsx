import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  Plus, 
  GripVertical, 
  Trash2,
  Clock,
  GitBranch,
  GitPullRequest,
  Bug,
  Lightbulb,
  Code,
  Eye
} from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'code' | 'issue' | 'pr' | 'review' | 'idea' | 'bug';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

const TodoDashboard = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  
  const [newTodo, setNewTodo] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  const getCategoryIcon = (category: TodoItem['category']) => {
    switch (category) {
      case 'code': return <Code className="w-4 h-4 text-blue-500" />;
      case 'issue': return <Bug className="w-4 h-4 text-red-500" />;
      case 'pr': return <GitPullRequest className="w-4 h-4 text-green-500" />;
      case 'review': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'idea': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
      default: return <GitBranch className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        category: 'code',
        priority: 'medium',
        createdAt: new Date()
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;

  const filteredTodos = showCompleted 
    ? todos 
    : todos.filter(t => !t.completed);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Development Tasks
              </CardTitle>
              <p className="text-slate-300 text-sm mt-1">
                {pendingCount} pending • {completedCount} completed
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Add new todo */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new development task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
            />
            <Button
              onClick={addTodo}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Priority distribution */}
          <div className="flex gap-2 text-xs">
            <Badge variant="outline" className="border-red-400 text-red-400">
              {todos.filter(t => t.priority === 'high' && !t.completed).length} High
            </Badge>
            <Badge variant="outline" className="border-yellow-400 text-yellow-400">
              {todos.filter(t => t.priority === 'medium' && !t.completed).length} Medium
            </Badge>
            <Badge variant="outline" className="border-green-400 text-green-400">
              {todos.filter(t => t.priority === 'low' && !t.completed).length} Low
            </Badge>
          </div>

          {/* Todo list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center gap-3 p-3 rounded-lg border-l-4 ${getPriorityColor(todo.priority)} bg-slate-800/50 hover:bg-slate-800 transition-all ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <GripVertical className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="flex-shrink-0 transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-blue-400" />
                  )}
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getCategoryIcon(todo.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${todo.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {todo.text}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0.5 ${
                      todo.priority === 'high' ? 'border-red-400 text-red-400' :
                      todo.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                      'border-green-400 text-green-400'
                    }`}
                  >
                    {todo.priority}
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-slate-400 hover:text-red-400 hover:bg-slate-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredTodos.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks found</p>
              <p className="text-sm">Add your first development task above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoDashboard;