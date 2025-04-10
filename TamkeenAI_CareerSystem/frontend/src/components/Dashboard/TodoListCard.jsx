import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Checkbox,
  TextField,
  Button,
  IconButton,
  Divider,
  InputAdornment,
  useTheme,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Paper
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';

// Sample avatars - in a real app, these would come from your user data
const avatars = [
  '/avatar1.jpg', 
  '/avatar2.jpg',
  '/avatar3.jpg',
  '/avatar4.jpg'
];

// Default avatar colors
const avatarColors = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7'];

const TodoListCard = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const initialTodos = data?.todos || [];
  const { t, i18n } = useTranslation();
  
  // Determine locale based on current language
  const locale = i18n.language === 'ar' ? arSA : enUS;
  const isRtl = i18n.language === 'ar';
  
  // Function to get task text based on current language
  const getTaskText = (index, defaultText) => {
    if (i18n.language === 'ar' && index < 4) {
      const key = `todoListComponent.taskTitle${index + 1}`;
      const translation = t(key);
      // Only use the translation if it's not the same as the key (indicating translation exists)
      return translation !== key ? translation : defaultText;
    }
    return defaultText;
  };
  
  const [todos, setTodos] = useState(initialTodos.length > 0 ? initialTodos : [
    { 
      task: "Deploy the website to the development hosting server", 
      dueTime: "10:00 AM", 
      completed: false, 
      pomodoros: 0,
      avatar: avatars[0] || null,
      assignee: "John D."
    },
    { 
      task: "Review and comment on website design", 
      dueTime: "02:30 PM", 
      completed: false, 
      pomodoros: 0,
      avatar: avatars[1] || null,
      assignee: "Emily R.",
      hasButton: true,
      buttonLabel: t('todoListComponent.feedback')
    },
    { 
      task: "Fix all the bugs reported by the team", 
      dueTime: "04:00 PM", 
      completed: false, 
      pomodoros: 1,
      avatar: avatars[0] || null,
      assignee: "John D."
    },
    { 
      task: "Prepare design files for web developer", 
      dueTime: t('calendarComponent.tomorrow'), 
      completed: false, 
      pomodoros: 0,
      avatar: avatars[2] || null,
      assignee: "Michael S.",
      progress: "0/2"
    }
  ]);
  const [newTask, setNewTask] = useState('');
  const [completed, setCompleted] = useState([]);
  
  // Pomodoro states
  const [activeTask, setActiveTask] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [timerType, setTimerType] = useState('work'); // 'work' or 'break'
  const timerRef = useRef(null);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  
  // Initialize completed tasks
  useEffect(() => {
    const completedIndices = todos
      .map((todo, index) => todo.completed ? index : -1)
      .filter(index => index !== -1);
    
    setCompleted(completedIndices);
  }, []);
  
  const openTaskMenu = (event, index) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTaskIndex(index);
  };
  
  const closeTaskMenu = () => {
    setAnchorEl(null);
    setSelectedTaskIndex(null);
  };
  
  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      const task = {
        task: newTask,
        dueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: false,
        pomodoros: 0,
        avatar: null,
        assignee: t('todoListComponent.me')
      };
      setTodos([...todos, task]);
      setNewTask('');
    }
  };
  
  const handleToggleComplete = (index) => {
    const updatedTodos = [...todos];
    updatedTodos[index].completed = !updatedTodos[index].completed;
    
    // Update completed count
    if (updatedTodos[index].completed) {
      setCompleted([...completed, index]);
      
      // If this task was active, stop the timer
      if (activeTask === index) {
        handleStopTimer();
      }
    } else {
      setCompleted(completed.filter(i => i !== index));
    }
    
    setTodos(updatedTodos);
  };
  
  const handleDeleteTask = (index) => {
    // If deleting active task, stop timer
    if (activeTask === index) {
      handleStopTimer();
    }
    
    // Adjust activeTask index if deleting a task before it
    if (activeTask !== null && index < activeTask) {
      setActiveTask(activeTask - 1);
    } else if (activeTask === index) {
      setActiveTask(null);
    }
    
    const updatedTodos = todos.filter((_, i) => i !== index);
    setTodos(updatedTodos);
    
    // Update completed count if a completed task was deleted
    if (completed.includes(index)) {
      setCompleted(completed.filter(i => i !== index));
    }
    
    closeTaskMenu();
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };
  
  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  // Get random color for avatar
  const getAvatarColor = (index) => {
    return avatarColors[index % avatarColors.length];
  };
  
  // Pomodoro functions
  const startPomodoro = (index) => {
    // Stop any running timer
    if (timerRunning) {
      clearInterval(timerRef.current);
    }
    
    setActiveTask(index);
    setTimerRunning(true);
    setTimerType('work');
    setTimeLeft(25 * 60); // 25 minutes
    
    closeTaskMenu();
  };
  
  const handleStartTimer = () => {
    setTimerRunning(true);
  };
  
  const handlePauseTimer = () => {
    setTimerRunning(false);
  };
  
  const handleStopTimer = () => {
    setTimerRunning(false);
    setActiveTask(null);
    clearInterval(timerRef.current);
  };
  
  const handleResetTimer = () => {
    setTimeLeft(timerType === 'work' ? 25 * 60 : 5 * 60);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time according to current locale
  const formatTimeWithLocale = (timeString) => {
    if (!timeString) return '';
    
    // If it's already in locale format, return as is
    if (typeof timeString === 'string' && 
        (timeString === t('calendarComponent.tomorrow') || 
         timeString === t('calendarComponent.today'))) {
      return timeString;
    }
    
    try {
      // Handle date objects or parsable date strings
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return format(date, 'p', { locale });
      }
      
      // Return original string if we can't parse it
      return timeString;
    } catch (e) {
      return timeString;
    }
  };
  
  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Time's up
            clearInterval(timerRef.current);
            
            // If work session ended, increment pomodoro count
            if (timerType === 'work' && activeTask !== null) {
              const updatedTodos = [...todos];
              updatedTodos[activeTask].pomodoros += 1;
              setTodos(updatedTodos);
              
              // Switch to break
              setTimerType('break');
              return 5 * 60; // 5 min break
            } else {
              // Break ended, switch back to work
              setTimerType('work');
              return 25 * 60;
            }
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timerRef.current);
    }
  }, [timerRunning, timerType, activeTask, todos]);
  
  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      direction: isRtl ? 'rtl' : 'ltr' // Apply RTL/LTR direction
    }}>
      {/* Task Input */}
      <Box sx={{ p: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={t('todoListComponent.addTask')}
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  edge="end" 
                  onClick={handleAddTask}
                >
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            ),
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: isDarkMode ? '#fff' : '#333'
            }
          }}
        />
      </Box>
      
      {/* Pomodoro Timer (visible when a task is active) */}
      {activeTask !== null && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            p: 1,
            mb: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={(timeLeft / (timerType === 'work' ? 25 * 60 : 5 * 60)) * 100}
              size={50}
              thickness={4}
              sx={{ 
                color: timerType === 'work' ? '#ff5252' : '#66bb6a',
                position: 'absolute',
              }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
          
          <Typography variant="caption" sx={{ mt: 0.5, mb: 1, opacity: 0.8, fontWeight: 500 }}>
            {timerType === 'work' ? t('todoListComponent.workTime') : t('todoListComponent.breakTime')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {timerRunning ? (
              <IconButton size="small" onClick={handlePauseTimer} sx={{ color: isDarkMode ? '#fff' : '#333' }}>
                <PauseIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton size="small" onClick={handleStartTimer} sx={{ color: isDarkMode ? '#fff' : '#333' }}>
                <PlayArrowIcon fontSize="small" />
              </IconButton>
            )}
            
            <IconButton size="small" onClick={handleResetTimer} sx={{ color: isDarkMode ? '#fff' : '#333' }}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
            
            <IconButton size="small" onClick={handleStopTimer} sx={{ color: isDarkMode ? '#fff' : '#333' }}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {todos.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            p: 2
          }}>
            <Typography variant="body2" sx={{ fontWeight: 500, textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.2)' : 'none' }}>
              {t('todoListComponent.noTasks')}
            </Typography>
          </Box>
        ) : (
          <Box>
            {todos.map((todo, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  opacity: todo.completed ? 0.7 : 1,
                  '&:hover': {
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Avatar */}
                <Avatar 
                  src={todo.avatar}
                  sx={{ 
                    mr: isRtl ? 0 : 2,
                    ml: isRtl ? 2 : 0,
                    bgcolor: getAvatarColor(index),
                    width: 38,
                    height: 38,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {getInitials(todo.assignee)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: isDarkMode ? '#fff' : '#333',
                      mb: 0.5,
                      textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {getTaskText(index, todo.task)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontWeight: 500,
                        textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      {formatTimeWithLocale(todo.dueTime)}
                    </Typography>
                    
                    {todo.assignee && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                          fontWeight: 500
                        }}
                      >
                        • {todo.assignee}
                      </Typography>
                    )}
                    
                    {todo.progress && (
                      <Chip
                        label={todo.progress}
                        size="small"
                        sx={{ 
                          ml: 'auto',
                          height: 24,
                          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
                          color: isDarkMode ? '#fff' : '#555',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                    
                    {todo.pomodoros > 0 && (
                      <Chip
                        icon={<TimerIcon fontSize="small" />}
                        label={todo.pomodoros}
                        size="small"
                        sx={{ 
                          height: 24,
                          bgcolor: isDarkMode ? 'rgba(255, 82, 82, 0.3)' : 'rgba(255, 82, 82, 0.15)',
                          color: isDarkMode ? '#ff8a80' : '#d32f2f',
                          '& .MuiChip-icon': { 
                            color: isDarkMode ? '#ff8a80' : '#d32f2f',
                            fontSize: '0.8rem'
                          },
                          '& .MuiChip-label': { 
                            px: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }
                        }}
                      />
                    )}
                  </Box>
                </Box>
                
                {todo.hasButton && (
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      mr: isRtl ? 0 : 1,
                      ml: isRtl ? 1 : 0,
                      bgcolor: isDarkMode ? 'rgba(100, 181, 246, 0.8)' : 'rgba(100, 181, 246, 0.7)',
                      color: isDarkMode ? '#fff' : '#333',
                      fontWeight: 'bold',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(100, 181, 246, 0.9)' : 'rgba(100, 181, 246, 0.8)'
                      }
                    }}
                  >
                    {todo.buttonLabel}
                  </Button>
                )}
                
                <Box sx={{ display: 'flex', ml: isRtl ? 0 : 1, mr: isRtl ? 1 : 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleComplete(index)}
                    sx={{ 
                      color: todo.completed 
                        ? (isDarkMode ? '#4caf50' : '#2e7d32') 
                        : (isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)'),
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    {todo.completed ? <DoneAllIcon /> : <CheckCircleOutlineIcon />}
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => openTaskMenu(e, index)}
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)',
                      '&:hover': {
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
      
      {/* Task menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeTaskMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: isRtl ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRtl ? 'left' : 'right',
        }}
      >
        <MenuItem onClick={() => { startPomodoro(selectedTaskIndex); }}>
          <ListItemIcon>
            <TimerIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('todoListComponent.startPomodoro')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleDeleteTask(selectedTaskIndex); }}>
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('todoListComponent.delete')}</ListItemText>
        </MenuItem>
      </Menu>
      
      {todos.length > 0 && (
        <>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
          <Typography variant="caption" sx={{ p: 1, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', fontWeight: 500, textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.1)' : 'none' }}>
            {t('todoListComponent.completed')}: {completed.length} | {t('todoListComponent.uncompleted')}: {todos.length - completed.length}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default TodoListCard; 