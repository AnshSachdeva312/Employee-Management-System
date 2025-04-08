import React, { useState, useEffect } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { 
  FaClock, 
  FaCalendarAlt, 
  FaUserClock, 
  FaHistory,
  FaFileExport,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { MdEventBusy, MdSettings } from "react-icons/md";
import { format, parseISO, isToday, differenceInHours } from 'date-fns';
import { toast } from 'react-toastify';

const EmpAttendance = () => {
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    type: 'Vacation',
    reason: ''
  });
  const [adminData, setAdminData] = useState({
    employee: '',
    date: '',
    status: 'Present',
    notes: ''
  });

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (user) {
      if (activeTab === 'attendance') {
        fetchAttendance();
      } else {
        fetchLeaves();
      }
    }
  }, [user, activeTab]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const endpoint = user.role === 1 ? "/api/attendance" : "/api/attendance/my-attendance";
      
      const response = await axios.get(`http://localhost:3000${endpoint}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      
      setAttendance(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const endpoint =  "/api/attendance/my-leaves";
      
      const response = await axios.get(`http://localhost:3000${endpoint}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      
      setLeaves(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/attendance/clock-in", {}, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Clocked in successfully");
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/attendance/clock-out", {}, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Clocked out successfully");
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to clock out");
    }
  };

  const handleLeaveSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/attendance/leave", leaveData, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Leave application submitted");
      setShowLeaveModal(false);
      setLeaveData({
        startDate: '',
        endDate: '',
        type: 'Vacation',
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply for leave");
    }
  };

  const handleAdminUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:3000/api/attendance", adminData, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Attendance updated successfully");
      setShowAdminModal(false);
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update attendance");
    }
  };

  const hasClockedInToday = () => {
    return attendance.some(record => 
      isToday(new Date(record.date)) && record.clockIn && !record.clockOut
    );
  };

  const hasCompletedAttendanceToday = () => {
    return attendance.some(record => 
      isToday(new Date(record.date)) && record.clockIn && record.clockOut
    );
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Present':
        return <FaCheckCircle style={{ color: '#10b981' }} />;
      case 'Absent':
        return <FaTimesCircle style={{ color: '#ef4444' }} />;
      case 'Late':
        return <FaExclamationTriangle style={{ color: '#f59e0b' }} />;
      case 'On Leave':
        return <MdEventBusy style={{ color: '#3b82f6' }} />;
      default:
        return <FaClock style={{ color: '#a0a0a0' }} />;
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      backgroundColor: "transparent", 
      color: "#fff" 
    }}>
      <EmpPanel user={{ 
        username: user?.name || "Unknown User", 
        email: user?.email || "No Email Available",
        phone: user?.phone || "No Phone Available" 
      }} />

      <div style={{ 
        flex: 1, 
        padding: "20px", 
        overflowY: "auto", 
        zIndex: 1,
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <h1 style={{ 
          textAlign: "center", 
          marginBottom: "20px",
          fontSize: "2.5rem",
          fontWeight: "600",
          color: "#e0e0e0",
          letterSpacing: "0.5px"
        }}>
          <FaUserClock style={{ marginRight: "10px" }} /> 
          Attendance Management
        </h1>

        {/* Quick Actions */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {!hasCompletedAttendanceToday() && (
            <button
              onClick={hasClockedInToday() ? handleClockOut : handleClockIn}
              style={{
                padding: "15px 30px",
                backgroundColor: hasClockedInToday() ? "rgba(239, 68, 68, 0.8)" : "rgba(16, 185, 129, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <FaClock /> {hasClockedInToday() ? "Clock Out" : "Clock In"}
            </button>
          )}

          <button
            onClick={() => setShowLeaveModal(true)}
            style={{
              padding: "15px 30px",
              backgroundColor: "rgba(99, 102, 241, 0.8)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
          >
            <MdEventBusy /> Apply Leave
          </button>

          {user?.role === 1 && (
            <button
              onClick={() => setShowAdminModal(true)}
              style={{
                padding: "15px 30px",
                backgroundColor: "rgba(245, 158, 11, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.2s ease"
              }}
            >
              <MdSettings /> Admin Tools
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          marginBottom: "20px"
        }}>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === 'attendance' ? "rgba(99, 102, 241, 0.5)" : "transparent",
              color: "white",
              border: "none",
              borderBottom: activeTab === 'attendance' ? "2px solid #6366f1" : "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <FaHistory /> Attendance History
          </button>

          <button
            onClick={() => setActiveTab('leaves')}
            style={{
              padding: "10px 20px",
              backgroundColor: activeTab === 'leaves' ? "rgba(99, 102, 241, 0.5)" : "transparent",
              color: "white",
              border: "none",
              borderBottom: activeTab === 'leaves' ? "2px solid #6366f1" : "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <MdEventBusy /> Leave History
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ 
            color: "#b0b0b0", 
            textAlign: "center", 
            fontSize: "1.2rem",
            marginTop: "40px"
          }}>Loading data...</p>
        ) : activeTab === 'attendance' ? (
          <div>
            {attendance.length === 0 ? (
              <p style={{ 
                textAlign: "center", 
                color: "rgba(255, 255, 255, 0.7)",
                padding: "40px"
              }}>
                No attendance records found
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
              }}>
                {attendance.map(record => (
                  <div key={record._id} style={{ 
                    background: "rgba(30, 20, 50, 0.7)", 
                    padding: "25px", 
                    borderRadius: "8px", 
                    borderLeft: "3px solid rgba(106, 17, 203, 0.5)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px"
                    }}>
                      <h3 style={{ 
                        color: "#ffffff", 
                        fontSize: "1.2rem",
                        margin: 0
                      }}>
                        {format(new Date(record.date), "MMMM d, yyyy")}
                      </h3>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}>
                        {getStatusIcon(record.status)}
                        <span style={{
                          color: record.status === 'Present' ? '#10b981' :
                                record.status === 'Late' ? '#f59e0b' :
                                record.status === 'On Leave' ? '#3b82f6' :
                                '#ef4444',
                          fontWeight: "500"
                        }}>
                          {record.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      margin: "15px 0",
                      padding: "15px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>Clock In:</span>
                        <span style={{ fontWeight: "500" }}>
                          {record.clockIn ? format(new Date(record.clockIn), "hh:mm a") : "--:--"}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>Clock Out:</span>
                        <span style={{ fontWeight: "500" }}>
                          {record.clockOut ? format(new Date(record.clockOut), "hh:mm a") : "--:--"}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>Working Hours:</span>
                        <span style={{ fontWeight: "500" }}>
                          {record.workingHours || "0"} hours
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <div style={{
                        padding: "10px",
                        background: "rgba(17, 8, 31, 0.5)",
                        borderRadius: "6px",
                        color: "#d0d0d0",
                        fontSize: "0.9rem"
                      }}>
                        {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {leaves.length === 0 ? (
              <p style={{ 
                textAlign: "center", 
                color: "rgba(255, 255, 255, 0.7)",
                padding: "40px"
              }}>
                No leave records found
              </p>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px"
              }}>
                {leaves.map(leave => (
                  <div key={leave._id} style={{ 
                    background: "rgba(30, 20, 50, 0.7)", 
                    padding: "25px", 
                    borderRadius: "8px", 
                    borderLeft: "3px solid rgba(106, 17, 203, 0.5)",
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px"
                    }}>
                      <h3 style={{ 
                        color: "#ffffff", 
                        fontSize: "1.2rem",
                        margin: 0
                      }}>
                        {leave.type} Leave
                      </h3>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px"
                      }}>
                        {leave.status === 'Approved' ? 
                          <FaCheckCircle style={{ color: '#10b981' }} /> :
                          leave.status === 'Rejected' ? 
                          <FaTimesCircle style={{ color: '#ef4444' }} /> :
                          <FaExclamationTriangle style={{ color: '#f59e0b' }} />}
                        <span style={{
                          color: leave.status === 'Approved' ? '#10b981' :
                                leave.status === 'Rejected' ? '#ef4444' :
                                '#f59e0b',
                          fontWeight: "500"
                        }}>
                          {leave.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      margin: "15px 0",
                      padding: "15px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: "6px"
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>From:</span>
                        <span style={{ fontWeight: "500" }}>
                          {format(new Date(leave.startDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>To:</span>
                        <span style={{ fontWeight: "500" }}>
                          {format(new Date(leave.endDate), "MMM d, yyyy")}
                        </span>
                      </div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between"
                      }}>
                        <span style={{ color: "#a0a0a0" }}>Days:</span>
                        <span style={{ fontWeight: "500" }}>
                          {differenceInHours(new Date(leave.endDate), new Date(leave.startDate)) / 24 + 1}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      marginBottom: "15px",
                      color: "#d0d0d0",
                      fontSize: "0.9rem"
                    }}>
                      <div style={{ fontWeight: "500", marginBottom: "5px" }}>Reason:</div>
                      {leave.reason}
                    </div>

                    {leave.notes && (
                      <div style={{
                        padding: "10px",
                        background: "rgba(17, 8, 31, 0.5)",
                        borderRadius: "6px",
                        color: "#d0d0d0",
                        fontSize: "0.9rem"
                      }}>
                        <div style={{ fontWeight: "500", marginBottom: "5px" }}>Admin Notes:</div>
                        {leave.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leave Application Modal */}
        {showLeaveModal && (
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
                  Apply for Leave
                </h2>
                <button
                  onClick={() => setShowLeaveModal(false)}
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
                  Leave Type
                </label>
                <select
                  value={leaveData.type}
                  onChange={(e) => setLeaveData({...leaveData, type: e.target.value})}
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
                  <option value="Vacation">Vacation</option>
                  <option value="Sick">Sick</option>
                  <option value="Personal">Personal</option>
                  <option value="Maternity/Paternity">Maternity/Paternity</option>
                  <option value="Bereavement">Bereavement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#C4B5FD",
                    marginBottom: "8px",
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={leaveData.startDate}
                    onChange={(e) => setLeaveData({...leaveData, startDate: e.target.value})}
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
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#C4B5FD",
                    marginBottom: "8px",
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={leaveData.endDate}
                    onChange={(e) => setLeaveData({...leaveData, endDate: e.target.value})}
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
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#C4B5FD",
                  marginBottom: "8px",
                }}>
                  Reason
                </label>
                <textarea
                  value={leaveData.reason}
                  onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
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
                  placeholder="Explain the reason for your leave"
                />
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}>
                <button
                  onClick={() => setShowLeaveModal(false)}
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
                  onClick={handleLeaveSubmit}
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
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tools Modal */}
        {showAdminModal && (
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
                  Admin Attendance Tools
                </h2>
                <button
                  onClick={() => setShowAdminModal(false)}
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
                  Employee ID
                </label>
                <input
                  type="text"
                  value={adminData.employee}
                  onChange={(e) => setAdminData({...adminData, employee: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(124, 58, 237, 0.5)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(17, 8, 31, 0.7)",
                    color: "#ffffff"
                  }}
                  placeholder="Enter employee ID"
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
                  Date
                </label>
                <input
                  type="date"
                  value={adminData.date}
                  onChange={(e) => setAdminData({...adminData, date: e.target.value})}
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
                  Status
                </label>
                <select
                  value={adminData.status}
                  onChange={(e) => setAdminData({...adminData, status: e.target.value})}
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
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="On Leave">On Leave</option>
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
                  Notes
                </label>
                <textarea
                  value={adminData.notes}
                  onChange={(e) => setAdminData({...adminData, notes: e.target.value})}
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
                  placeholder="Enter any notes"
                />
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}>
                <button
                  onClick={() => setShowAdminModal(false)}
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
                  onClick={handleAdminUpdate}
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
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpAttendance;