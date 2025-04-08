const express = require('express');
const taskRouter = express.Router();

const adminMiddleware = require('../middleware/adminMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { createTask, updateTask, deleteTask, getMyTasks, addComment, getTask, getTasks } = require('../controllers/taskController');


// Manager-only routes
taskRouter.post('/',authMiddleware, adminMiddleware,createTask);
taskRouter.put('/:id',authMiddleware,updateTask );
taskRouter.delete('/:id', authMiddleware,adminMiddleware, deleteTask);

// Employee routes
taskRouter.get('/my-tasks',authMiddleware,getMyTasks );
taskRouter.post('/:id/comments',authMiddleware,addComment);

// Shared routes
taskRouter.get('/',authMiddleware,getTasks );
taskRouter.get('/:id',authMiddleware,getTask );
// Add this route:

module.exports = taskRouter;