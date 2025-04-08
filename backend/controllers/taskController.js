const Task = require('../models/taskModel');
const User = require('../models/userModel');

// Create a new task
const createTask = async (req, res) => {
    try {
      const { title, description, dueDate, priority, assignedTo } = req.body;
      
      // Verify assigned user exists
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
  
      const task = new Task({
        title,
        description,
        dueDate,
        priority,
        assignedTo,
        assignedBy: req.user.id
      });
  
      await task.save();
  
      // Removed email notification code
      res.status(201).json({
        success: true,
        data: task
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };
  

// Get all tasks (with filtering)
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, sortBy } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    // Default sorting by due date
    let sortOption = { dueDate: 1 };
    if (sortBy === 'priority') sortOption = { priority: -1 };
    if (sortBy === 'createdAt') sortOption = { createdAt: -1 };

    const tasks = await Task.find(query)
      .sort(sortOption)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Check if task exists
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is admin OR the assigned employee
    if (req.user.role !== 1 && !task.assignedTo.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Employees can only update status
    const updateData = req.user.role === 1 ? req.body : { status: req.body.status };

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Add comment to task
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user.id,
            text
          }
        }
      },
      { new: true }
    ).populate('comments.user', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task.comments
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// Get tasks assigned to current user
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .sort({ dueDate: 1 })
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
module.exports={createTask,updateTask,deleteTask,getMyTasks,getTask,getTasks,addComment}