import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Checkbox, Chip, CircularProgress, Alert, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Select, FormControl, InputLabel,
  Tooltip, Tab, Tabs, FormGroup, FormControlLabel,
  Switch, Avatar, Badge, Drawer, useMediaQuery,
  LinearProgress, Snackbar, Collapse, RadioGroup, Radio
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add, Delete, Edit, CheckCircle, RadioButtonUnchecked,
  Sort, FilterList, MoreVert, Close, Search, Flag,
  AssignmentOutlined, Assignment, AssignmentLate,
  AssignmentTurnedIn, CalendarToday, AccessTime,
  Description, Category, ArrowUpward, ArrowDownward,
  ExpandMore, ExpandLess, Refresh, Archive, Unarchive,
  PlaylistAdd, Work, School, Business, DragIndicator,
  Event, Link, CheckCircleOutline, Star, StarBorder,
  HighlightOff, Favorite, Schedule, Today, DateRange,
  InsertInvitation, NotificationsActive, NotificationsOff,
  PriorityHigh, LowPriority, Send, AttachFile
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO, isAfter, isBefore, addDays, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TaskManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    status: 'all', // all, active, completed
    priority: [], // high, medium, low
    dueDate: 'all', // all, today, thisWeek, overdue, upcoming
    category: [] // work, education, application, etc.
  });
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    category: 'general',
    completed: false,
    reminder: false,
    reminderTime: null,
    relatedTo: null,
    relatedType: null,
    attachments: []
  });
  const [taskLists, setTaskLists] = useState([
    { id: 'default', name: 'Default', tasks: [] },
    { id: 'work', name: 'Work', tasks: [] },
    { id: 'personal', name: 'Personal', tasks: [] }
  ]);
  const [currentList, setCurrentList] = useState('default');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [expanded, setExpanded] = useState({});
  const [bulkActions, setBulkActions] = useState([]);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch tasks
        const tasksResponse = await apiEndpoints.tasks.getUserTasks(profile.id);
        const userTasks = tasksResponse.data || [];
        
        // Fetch task lists
        const listsResponse = await apiEndpoints.tasks.getUserTaskLists(profile.id);
        const userLists = listsResponse.data || [];
        
        // Organize tasks by list
        const tasksMap = {};
        userTasks.forEach(task => {
          const listId = task.listId || 'default';
          if (!tasksMap[listId]) {
            tasksMap[listId] = [];
          }
          tasksMap[listId].push(task);
        });
        
        // Update lists with tasks
        const processedLists = userLists.length > 0 
          ? userLists.map(list => ({
              id: list.id,
              name: list.name,
              tasks: tasksMap[list.id] || []
            }))
          : [
              { id: 'default', name: 'Default', tasks: tasksMap['default'] || [] },
              { id: 'work', name: 'Work', tasks: tasksMap['work'] || [] },
              { id: 'personal', name: 'Personal', tasks: tasksMap['personal'] || [] }
            ];
        
        setTaskLists(processedLists);
        setTasks(userTasks);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [profile]);
  
  // Handle adding a new task
  const handleAddTask = async () => {
    if (!taskForm.title.trim()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const newTask = {
        ...taskForm,
        userId: profile.id,
        listId: currentList,
        createdAt: new Date().toISOString()
      };
      
      const response = await apiEndpoints.tasks.createTask(newTask);
      const createdTask = response.data;
      
      // Update the task lists
      const updatedLists = taskLists.map(list => {
        if (list.id === currentList) {
          return {
            ...list,
            tasks: [...list.tasks, createdTask]
          };
        }
        return list;
      });
      
      setTaskLists(updatedLists);
      setTasks([...tasks, createdTask]);
      setTaskDialogOpen(false);
      setSnackbarMessage('Task added successfully');
      setSnackbarOpen(true);
      
      // Reset form
      setTaskForm({
        title: '',
        description: '',
        dueDate: null,
        priority: 'medium',
        category: 'general',
        completed: false,
        reminder: false,
        reminderTime: null,
        relatedTo: null,
        relatedType: null,
        attachments: []
      });
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle editing a task
  const handleEditTask = async () => {
    if (!taskForm.title.trim() || !currentTask) {
      return;
    }
    
    setLoading(true);
    
    try {
      const updatedTask = {
        ...currentTask,
        ...taskForm,
        updatedAt: new Date().toISOString()
      };
      
      const response = await apiEndpoints.tasks.updateTask(currentTask.id, updatedTask);
      const editedTask = response.data;
      
      // Update the task lists
      const updatedLists = taskLists.map(list => {
        if (list.id === editedTask.listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === editedTask.id ? editedTask : task
            )
          };
        }
        return list;
      });
      
      setTaskLists(updatedLists);
      setTasks(tasks.map(task => (task.id === editedTask.id ? editedTask : task)));
      setTaskDialogOpen(false);
      setSnackbarMessage('Task updated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    
    try {
      await apiEndpoints.tasks.deleteTask(taskId);
      
      // Find the list containing the task
      const taskListId = tasks.find(task => task.id === taskId)?.listId || currentList;
      
      // Update the task lists
      const updatedLists = taskLists.map(list => {
        if (list.id === taskListId) {
          return {
            ...list,
            tasks: list.tasks.filter(task => task.id !== taskId)
          };
        }
        return list;
      });
      
      setTaskLists(updatedLists);
      setTasks(tasks.filter(task => task.id !== taskId));
      setSnackbarMessage('Task deleted successfully');
      setSnackbarOpen(true);
      
      // Close any open menus
      setTaskMenuAnchorEl(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle toggling task completion
  const handleToggleTaskComplete = async (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
    
    try {
      const updatedTask = {
        ...taskToUpdate,
        completed: !taskToUpdate.completed,
        completedAt: !taskToUpdate.completed ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString()
      };
      
      const response = await apiEndpoints.tasks.updateTask(taskId, updatedTask);
      const editedTask = response.data;
      
      // Update the task lists
      const updatedLists = taskLists.map(list => {
        if (list.id === editedTask.listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => 
              task.id === editedTask.id ? editedTask : task
            )
          };
        }
        return list;
      });
      
      setTaskLists(updatedLists);
      setTasks(tasks.map(task => (task.id === editedTask.id ? editedTask : task)));
      
      setSnackbarMessage(
        editedTask.completed 
          ? 'Task marked as completed' 
          : 'Task marked as incomplete'
      );
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };
  
  // Handle dragging and dropping tasks
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // If the task is moved within the same list
    if (source.droppableId === destination.droppableId) {
      const listIndex = taskLists.findIndex(list => list.id === source.droppableId);
      const list = taskLists[listIndex];
      const newTasks = Array.from(list.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      
      // Update the list with new task order
      const newList = {
        ...list,
        tasks: newTasks
      };
      
      const newLists = [...taskLists];
      newLists[listIndex] = newList;
      
      setTaskLists(newLists);
      
      // Update task order in the backend
      try {
        await apiEndpoints.tasks.updateTasksOrder(source.droppableId, newTasks.map(task => task.id));
      } catch (err) {
        console.error('Error updating task order:', err);
      }
    } else {
      // If the task is moved to a different list
      const sourceListIndex = taskLists.findIndex(list => list.id === source.droppableId);
      const destListIndex = taskLists.findIndex(list => list.id === destination.droppableId);
      
      const sourceList = taskLists[sourceListIndex];
      const destList = taskLists[destListIndex];
      
      const sourceTasks = Array.from(sourceList.tasks);
      const destTasks = Array.from(destList.tasks);
      
      const [movedTask] = sourceTasks.splice(source.index, 1);
      
      // Update the task with the new list ID
      const updatedTask = {
        ...movedTask,
        listId: destination.droppableId,
        updatedAt: new Date().toISOString()
      };
      
      destTasks.splice(destination.index, 0, updatedTask);
      
      const newLists = [...taskLists];
      newLists[sourceListIndex] = {
        ...sourceList,
        tasks: sourceTasks
      };
      newLists[destListIndex] = {
        ...destList,
        tasks: destTasks
      };
      
      setTaskLists(newLists);
      
      // Update the task in the backend
      try {
        await apiEndpoints.tasks.updateTask(movedTask.id, updatedTask);
        
        // Update task orders
        await Promise.all([
          apiEndpoints.tasks.updateTasksOrder(source.droppableId, sourceTasks.map(task => task.id)),
          apiEndpoints.tasks.updateTasksOrder(destination.droppableId, destTasks.map(task => task.id))
        ]);
      } catch (err) {
        console.error('Error moving task to different list:', err);
      }
    }
  };
  
  // Filter tasks based on current filters
  const getFilteredTasks = (tasksList) => {
    if (!tasksList?.length) return [];
    
    return tasksList.filter(task => {
      // Filter by search term
      if (
        searchTerm &&
        !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      // Filter by status
      if (filters.status === 'active' && task.completed) {
        return false;
      }
      if (filters.status === 'completed' && !task.completed) {
        return false;
      }
      
      // Filter by priority
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }
      
      // Filter by category
      if (filters.category.length > 0 && !filters.category.includes(task.category)) {
        return false;
      }
      
      // Filter by due date
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        
        if (filters.dueDate === 'today' && !isToday(dueDate)) {
          return false;
        }
        if (filters.dueDate === 'tomorrow' && !isTomorrow(dueDate)) {
          return false;
        }
        if (filters.dueDate === 'thisWeek' && !isThisWeek(dueDate)) {
          return false;
        }
        if (filters.dueDate === 'overdue' && !isBefore(dueDate, new Date())) {
          return false;
        }
        if (filters.dueDate === 'upcoming' && !isAfter(dueDate, new Date())) {
          return false;
        }
      } else if (filters.dueDate !== 'all' && filters.dueDate !== 'noDueDate') {
        return filters.dueDate === 'noDueDate';
      }
      
      return true;
    });
  };
  
  // Sort tasks based on current sort settings
  const getSortedTasks = (tasksList) => {
    if (!tasksList?.length) return [];
    
    return [...tasksList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) {
            comparison = 0;
          } else if (!a.dueDate) {
            comparison = 1;
          } else if (!b.dueDate) {
            comparison = -1;
          } else {
            comparison = new Date(a.dueDate) - new Date(b.dueDate);
          }
          break;
          
        case 'priority':
          const priorityValues = { high: 3, medium: 2, low: 1 };
          comparison = priorityValues[b.priority] - priorityValues[a.priority];
          break;
          
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
          
        case 'createdAt':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
          
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };
  
  // Render task list
  const renderTaskList = (list) => {
    const filteredTasks = getFilteredTasks(list.tasks);
    const sortedTasks = getSortedTasks(filteredTasks);
    
    return (
      <Box key={list.id} sx={{ mb: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {list.name}
        </Typography>
        
        <Paper>
          {sortedTasks.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No tasks found
              </Typography>
              <Button
                startIcon={<Add />}
                onClick={() => {
                  setCurrentList(list.id);
                  setIsEditMode(false);
                  setTaskForm({
                    title: '',
                    description: '',
                    dueDate: null,
                    priority: 'medium',
                    category: 'general',
                    completed: false,
                    reminder: false,
                    reminderTime: null,
                    relatedTo: null,
                    relatedType: null,
                    attachments: []
                  });
                  setTaskDialogOpen(true);
                }}
                sx={{ mt: 1 }}
              >
                Add a task
              </Button>
            </Box>
          ) : (
            <Droppable droppableId={list.id}>
              {(provided) => (
                <List
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{ 
                    p: 0, 
                    '& .MuiListItem-root': {
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }
                  }}
                >
                  {sortedTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ 
                            bgcolor: task.completed ? 'action.selected' : 'inherit',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.7 : 1
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ mr: 1, cursor: 'grab' }}>
                            <DragIndicator color="action" fontSize="small" />
                          </Box>
                          
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={task.completed}
                              onChange={() => handleToggleTaskComplete(task.id)}
                              icon={<RadioButtonUnchecked />}
                              checkedIcon={<CheckCircle />}
                              sx={{ color: getPriorityColor(task.priority) }}
                            />
                          </ListItemIcon>
                          
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <Box>
                                {task.dueDate && (
                                  <Chip
                                    icon={<CalendarToday fontSize="small" />}
                                    label={format(new Date(task.dueDate), 'MMM d, yyyy')}
                                    size="small"
                                    color={getDateColor(task.dueDate)}
                                    variant="outlined"
                                    sx={{ mr: 1, mt: 0.5 }}
                                  />
                                )}
                                
                                <Chip
                                  icon={getPriorityIcon(task.priority)}
                                  label={task.priority}
                                  size="small"
                                  color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'success'}
                                  variant="outlined"
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                                
                                {task.category && (
                                  <Chip
                                    icon={<Category fontSize="small" />}
                                    label={task.category}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mr: 1, mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            }
                            onClick={() => {
                              setExpanded({
                                ...expanded,
                                [task.id]: !expanded[task.id]
                              });
                            }}
                          />
                          
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={(e) => {
                                setTaskMenuAnchorEl(e.currentTarget);
                                setSelectedTask(task);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          )}
        </Paper>
      </Box>
    );
  };
  
  // Helper functions
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'primary';
    }
  };
  
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <PriorityHigh fontSize="small" />;
      case 'medium':
        return <Flag fontSize="small" />;
      case 'low':
        return <LowPriority fontSize="small" />;
      default:
        return <Flag fontSize="small" />;
    }
  };
  
  const getDateColor = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (isBefore(date, today)) {
      return 'error';
    }
    
    if (isToday(date)) {
      return 'warning';
    }
    
    return 'default';
  };
  
  // Task dialog
  const renderTaskDialog = () => (
    <Dialog
      open={taskDialogOpen}
      onClose={() => !loading && setTaskDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditMode ? 'Edit Task' : 'Add New Task'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          label="Task Title"
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          fullWidth
          margin="normal"
          variant="outlined"
          required
          autoFocus
        />
        
        <TextField
          label="Description"
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Due Date"
            value={taskForm.dueDate ? new Date(taskForm.dueDate) : null}
            onChange={(date) => setTaskForm({ ...taskForm, dueDate: date })}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            )}
          />
        </LocalizationProvider>
        
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel>Priority</InputLabel>
          <Select
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            label="Priority"
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel>Category</InputLabel>
          <Select
            value={taskForm.category}
            onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
            label="Category"
          >
            <MenuItem value="general">General</MenuItem>
            <MenuItem value="work">Work</MenuItem>
            <MenuItem value="personal">Personal</MenuItem>
            <MenuItem value="application">Job Application</MenuItem>
            <MenuItem value="interview">Interview Prep</MenuItem>
            <MenuItem value="learning">Learning</MenuItem>
          </Select>
        </FormControl>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={taskForm.reminder}
                onChange={(e) => setTaskForm({ ...taskForm, reminder: e.target.checked })}
              />
            }
            label="Set Reminder"
          />
        </Box>
        
        {taskForm.reminder && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Reminder Date"
              value={taskForm.reminderTime ? new Date(taskForm.reminderTime) : null}
              onChange={(date) => setTaskForm({ ...taskForm, reminderTime: date })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
              )}
            />
          </LocalizationProvider>
        )}
        
        {isEditMode && (
          <FormControlLabel
            control={
              <Checkbox
                checked={taskForm.completed}
                onChange={(e) => setTaskForm({ ...taskForm, completed: e.target.checked })}
              />
            }
            label="Mark as Completed"
          />
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setTaskDialogOpen(false)} disabled={loading}>
          Cancel
        </Button>
        
        <Button
          onClick={isEditMode ? handleEditTask : handleAddTask}
          color="primary"
          variant="contained"
          startIcon={isEditMode ? <Save /> : <Add />}
          disabled={loading || !taskForm.title.trim()}
        >
          {loading ? (
            <CircularProgress size={24} />
          ) : isEditMode ? (
            'Save Changes'
          ) : (
            'Add Task'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Manager
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', mb: 3 }}>
          <TextField
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Filter
          </Button>
          
          <Button
            variant="outlined"
            startIcon={sortDirection === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            sx={{ ml: 1 }}
          >
            Sort
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setIsEditMode(false);
              setTaskForm({
                title: '',
                description: '',
                dueDate: null,
                priority: 'medium',
                category: 'general',
                completed: false,
                reminder: false,
                reminderTime: null,
                relatedTo: null,
                relatedType: null,
                attachments: []
              });
              setTaskDialogOpen(true);
            }}
            sx={{ ml: 'auto' }}
          >
            New Task
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LoadingSpinner message="Loading tasks..." />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            {taskLists.map(list => renderTaskList(list))}
          </DragDropContext>
        )}
      </Paper>
      
      {renderTaskDialog()}
      
      {/* Task menu */}
      <Menu
        anchorEl={taskMenuAnchorEl}
        open={Boolean(taskMenuAnchorEl)}
        onClose={() => setTaskMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setTaskMenuAnchorEl(null);
            setCurrentTask(selectedTask);
            setTaskForm({
              title: selectedTask.title,
              description: selectedTask.description || '',
              dueDate: selectedTask.dueDate,
              priority: selectedTask.priority,
              category: selectedTask.category,
              completed: selectedTask.completed,
              reminder: selectedTask.reminder,
              reminderTime: selectedTask.reminderTime,
              relatedTo: selectedTask.relatedTo,
              relatedType: selectedTask.relatedType,
              attachments: selectedTask.attachments || []
            });
            setIsEditMode(true);
            setTaskDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        
        <MenuItem onClick={() => handleToggleTaskComplete(selectedTask.id)}>
          <ListItemIcon>
            {selectedTask?.completed ? (
              <RadioButtonUnchecked fontSize="small" />
            ) : (
              <CheckCircle fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText primary={selectedTask?.completed ? "Mark as Incomplete" : "Mark as Complete"} />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => handleDeleteTask(selectedTask.id)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TaskManager;