import { useEffect, useState } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { FaMoneyBillWave, FaCalendarAlt, FaFileAlt, FaCheckCircle, FaTasks } from "react-icons/fa";

const EmpTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: ""
  });

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch tasks and users
  useEffect(() => {
    if (user) {
      fetchTasks();
      if (user.role === 1) fetchUsers();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = user.role === 1 ? "/api/tasks" : "/api/tasks/my-tasks";
      
      const response = await axios.get(`http://localhost:3000${endpoint}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      
      // Check for overdue tasks before setting state
      const updatedTasks = response.data.data.map(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        if (dueDate < today && task.status !== 'Completed') {
          return { ...task, status: 'Overdue' };
        }
        return task;
      });
      
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/auth/all", {
        headers: { authorization: `Bearer ${token}` }
      });
      setUsers(response.data.filter(u => u._id !== user?._id));
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const createTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:3000/api/tasks", taskData, {
        headers: { 
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setShowModal(false);
      setTaskData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedTo: ""
      });
      fetchTasks();
    } catch (error) {
      console.error("Error creating task", error.response?.data || error.message);
      alert(`Error creating task: ${error.response?.data?.message || error.message}`);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/tasks/${taskId}`,
        { status: newStatus },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const submitTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/tasks/${taskId}`,
        { status: "Completed" },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error("Error submitting task", error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/tasks/${taskId}`,
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  // Calculate task status distribution for semicircle
  const statusData = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    Pending: "#6366f1", // Purple
    "In Progress": "#f59e0b", // Amber
    Completed: "#10b981", // Emerald
    Overdue: "#ef4444" // Red
  };

  // Get background color based on task status and user role
  const getTaskBackgroundColor = (task) => {
    switch (task.status) {
      case 'Completed':
        return "rgba(16, 185, 129, 0.1)";
      case 'In Progress':
        return "rgba(245, 158, 11, 0.1)";
      case 'Overdue':
        return "rgba(239, 68, 68, 0.1)";
      default:
        return "rgba(99, 102, 241, 0.1)";
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#ffffff" }}>
      <EmpPanel
        user={{
          username: user?.name || "Unknown User",
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available",
        }}
      />

      <div style={{ 
        width: "100%", 
        padding: "30px", 
        overflowY: "auto",
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ 
            fontSize: "24px", 
            fontWeight: "600", 
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px"
          }}>
            <FaTasks /> Task Management
          </h1>
          {user?.role === 1 && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "10px auto 0",
                transition: "all 0.2s ease"
              }}
            >
              <span style={{ fontSize: "16px" }}>+</span> New Task
            </button>
          )}
        </div>

        {/* Status Overview Semicircle */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "30px",
          backgroundColor: "rgba(30, 20, 50, 0.7)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(124, 58, 237, 0.3)"
        }}>
          <div style={{ width: "300px", height: "150px", position: "relative" }}>
            {/* Semicircle base */}
            <div style={{
              width: "100%",
              height: "150px",
              borderTopLeftRadius: "150px",
              borderTopRightRadius: "150px",
              border: "20px solid rgba(30, 20, 50, 0.9)",
              borderBottom: "0",
              boxSizing: "border-box",
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Status segments */}
              {Object.entries(statusData).map(([status, count], i) => {
                const percentage = (count / tasks.length) * 100;
                const rotation = i === 0 ? 0 : 
                  Object.entries(statusData).slice(0, i).reduce((sum, [_, c]) => 
                    sum + (c / tasks.length) * 180, 0);
                
                return (
                  <div 
                    key={status}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      clipPath: `polygon(50% 50%, ${50 + Math.sin(rotation * Math.PI / 180) * 50}% ${50 - Math.cos(rotation * Math.PI / 180) * 50}%, ${50 + Math.sin((rotation + percentage * 1.8) * Math.PI / 180) * 50}% ${50 - Math.cos((rotation + percentage * 1.8) * Math.PI / 180) * 50}%)`,
                      backgroundColor: statusColors[status] || "#a0aec0",
                      transformOrigin: "50% 100%"
                    }}
                  />
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "20px"
            }}>
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} style={{ 
                  display: "flex", 
                  alignItems: "center",
                  backgroundColor: "rgba(30, 20, 50, 0.7)",
                  padding: "4px 8px",
                  borderRadius: "20px",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: color,
                    borderRadius: "50%",
                    marginRight: "5px"
                  }} />
                  <span style={{ 
                    fontSize: "12px",
                    color: "#ffffff"
                  }}>
                    {status}: {statusData[status] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            marginBottom: "20px" 
          }}>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#ffffff",
              marginRight: "15px",
            }}>
              {user?.role === 1 ? "Assigned Tasks" : "Your Tasks"}
            </h2>
            <div style={{ 
              flex: 1, 
              height: "1px", 
              backgroundColor: "rgba(255, 255, 255, 0.2)" 
            }}></div>
          </div>

          {tasks.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "rgba(255, 255, 255, 0.7)",
            }}>
              No tasks {user?.role === 1 ? "assigned yet" : "assigned to you yet"}
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                style={{
                  width: "100%",
                  backgroundColor: getTaskBackgroundColor(task),
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(5px)"
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#ffffff",
                      marginBottom: "5px",
                    }}>
                      {task.title}
                    </h3>
                    <p style={{ 
                      color: "rgba(255, 255, 255, 0.8)", 
                      marginBottom: "10px" 
                    }}>
                      <span style={{ fontWeight: "500" }}>Due:</span> {new Date(task.dueDate).toLocaleDateString()} at {task.time || "23:59"}
                    </p>
                    <p style={{ 
                      color: "rgba(255, 255, 255, 0.8)", 
                      marginBottom: "10px" 
                    }}>
                      <span style={{ fontWeight: "500" }}>Priority:</span> {task.priority}
                    </p>
                    <p style={{ 
                      color: "rgba(255, 255, 255, 0.8)", 
                      marginBottom: "10px" 
                    }}>
                      {task.description}
                    </p>
                    {user?.role === 1 && task.assignedTo && (
                      <p style={{ 
                        color: "rgba(255, 255, 255, 0.8)", 
                        marginBottom: "10px" 
                      }}>
                        <span style={{ fontWeight: "500" }}>Assigned to:</span> {task.assignedTo.name}
                      </p>
                    )}
                  </div>

                  <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "10px" 
                  }}>
                    {user?.role === 1 && (
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid rgba(124, 58, 237, 0.5)",
                          backgroundColor: "rgba(30, 20, 50, 0.7)",
                          color: "#ffffff",
                          cursor: "pointer"
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    )}
                    
                    {user?.role === 0 && task.status === "Pending" && (
                      <button
                        onClick={() => submitTask(task._id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(16, 185, 129, 0.8)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Submit Task
                      </button>
                    )}
                    
                    {user?.role === 1 && (
                      <button
                        onClick={() => deleteTask(task._id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "rgba(239, 68, 68, 0.8)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Task Modal */}
        {showModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(5px)"
          }}>
            <div style={{
              backgroundColor: "rgba(30, 20, 50, 0.95)",
              borderRadius: "12px",
              padding: "25px",
              width: "500px",
              boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(106, 17, 203, 0.3)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}>
                <h2 style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#A78BFA",
                }}>
                  Create New Task
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.7)"
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Title
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff"
                  }}
                  placeholder="Task title"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({...taskData, description: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff",
                    minHeight: "100px",
                    resize: "vertical"
                  }}
                  placeholder="Task description"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff"
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Priority
                </label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Assign To
                </label>
                <select
                  value={taskData.assignedTo}
                  onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select an employee</option>
                  {users.map((user) => (
                    <option 
                      key={user._id} 
                      value={user._id}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "transparent",
                    color: "#A78BFA",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createTask}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "rgba(99, 102, 241, 0.8)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpTasks;