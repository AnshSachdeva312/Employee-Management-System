import React, { useState, useEffect } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { 
  FaCalendarAlt, 
  FaTag, 
  FaExclamationCircle, 
  FaUsers,
  FaEdit,
  FaTrash
} from "react-icons/fa";

const EmpAnnouncements = () => {
  const [user, setUser] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General Information",
    priority: "Medium",
    visibility: "All Employees",
    scheduledDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return setError("Unauthorized: No token found ❌");

      const res = await axios.get("http://localhost:3000/api/announcements", {
        headers: { authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) setAnnouncements(res.data);
      else setAnnouncements([]);
    } catch (error) {
      setError("Failed to fetch announcements.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("Unauthorized: No token found ❌");

      if (editingAnnouncement) {
        await axios.put(
          `http://localhost:3000/api/announcements/${editingAnnouncement._id}`,
          formData,
          { headers: { authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post("http://localhost:3000/api/announcements", formData, {
          headers: { authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        description: "",
        category: "General Information",
        priority: "Medium",
        visibility: "All Employees",
        scheduledDate: new Date().toISOString().split("T")[0],
      });
      fetchAnnouncements();
    } catch (error) {
      setError("Failed to save announcement.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return setError("Unauthorized: No token found ❌");

      await axios.delete(`http://localhost:3000/api/announcements/${id}`, {
        headers: { authorization: `Bearer ${token}` },
      });

      fetchAnnouncements();
    } catch (error) {
      setError("Failed to delete announcement.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "General Information",
      priority: "Medium",
      visibility: "All Employees",
      scheduledDate: new Date().toISOString().split("T")[0],
    });
    setEditingAnnouncement(null);
    setShowModal(false);
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
        }}>Announcements</h1>
        
        {user.role === 1 && (
          <button 
            onClick={() => setShowModal(true)} 
            style={{ 
              margin: "20px auto", 
              padding: "12px 24px", 
              background: "rgba(74, 20, 140, 0.8)", 
              color: "#ffffff", 
              border: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "6px", 
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1rem",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(94, 30, 160, 0.9)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(74, 20, 140, 0.8)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <span>+</span> Add Announcement
          </button>
        )}
        
        {loading ? (
          <p style={{ 
            color: "#b0b0b0", 
            textAlign: "center", 
            fontSize: "1.2rem",
            marginTop: "40px"
          }}>Loading announcements...</p>
        ) : (
          <div>
            <h2 style={{ 
              color: "#d0d0d0", 
              marginBottom: "25px", 
              fontSize: "1.5rem",
              fontWeight: "500",
              paddingBottom: "10px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              Upcoming Announcements
            </h2>
            
            {announcements.map((announcement) => (
              <div key={announcement._id} style={{ 
                background: "rgba(30, 20, 50, 0.7)", 
                padding: "25px", 
                marginBottom: "25px", 
                borderRadius: "8px", 
                color: "#e0e0e0",
                borderLeft: "1px solid rgba(106, 17, 203, 0.5)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.3)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
              }}
              >
                {/* Title Section */}
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ 
                    color: "#ffffff", 
                    fontSize: "1.3rem", 
                    fontWeight: "500",
                    marginBottom: "10px"
                  }}>
                    {announcement.title}
                  </h3>
                </div>

                {/* Description Section */}
                <div style={{ 
                  marginBottom: "20px",
                  padding: "15px",
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: "6px",
                  borderLeft: "2px solid rgba(106, 17, 203, 0.5)"
                }}>
                  <p style={{ 
                    color: "#d0d0d0", 
                    fontSize: "1rem", 
                    lineHeight: "1.6"
                  }}>
                    {announcement.description}
                  </p>
                </div>

                {/* Metadata Section */}
                <div style={{ 
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginTop: "20px"
                }}>
                  {/* Date */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    padding: "12px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <FaCalendarAlt style={{ 
                      color: "#a0a0a0", 
                      fontSize: "1.1rem" 
                    }} />
                    <div>
                      <p style={{ 
                        color: "#b0b0b0", 
                        fontSize: "0.85rem", 
                        marginBottom: "3px"
                      }}>
                        Date
                      </p>
                      <p style={{ 
                        color: "#ffffff", 
                        fontSize: "0.95rem"
                      }}>
                        {new Date(announcement.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    padding: "12px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <FaTag style={{ 
                      color: "#a0a0a0", 
                      fontSize: "1.1rem" 
                    }} />
                    <div>
                      <p style={{ 
                        color: "#b0b0b0", 
                        fontSize: "0.85rem", 
                        marginBottom: "3px"
                      }}>
                        Category
                      </p>
                      <p style={{ 
                        color: "#ffffff", 
                        fontSize: "0.95rem"
                      }}>
                        {announcement.category}
                      </p>
                    </div>
                  </div>

                  {/* Priority */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    padding: "12px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <FaExclamationCircle style={{ 
                      color: "#a0a0a0",
                      fontSize: "1.1rem" 
                    }} />
                    <div>
                      <p style={{ 
                        color: "#b0b0b0", 
                        fontSize: "0.85rem", 
                        marginBottom: "3px"
                      }}>
                        Priority
                      </p>
                      <p style={{ 
                        color: "#ffffff", 
                        fontSize: "0.95rem"
                      }}>
                        {announcement.priority}
                      </p>
                    </div>
                  </div>

                  {/* Attendees */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px",
                    padding: "12px",
                    background: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    <FaUsers style={{ 
                      color: "#a0a0a0", 
                      fontSize: "1.1rem" 
                    }} />
                    <div>
                      <p style={{ 
                        color: "#b0b0b0", 
                        fontSize: "0.85rem", 
                        marginBottom: "3px"
                      }}>
                        Attendees
                      </p>
                      <p style={{ 
                        color: "#ffffff", 
                        fontSize: "0.95rem"
                      }}>
                        {announcement.visibility}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (for admin) */}
                {user.role === 1 && (
                  <div style={{ 
                    display: "flex", 
                    gap: "12px", 
                    marginTop: "25px",
                    justifyContent: "flex-end"
                  }}>
                    <button 
                      onClick={() => { 
                        setEditingAnnouncement(announcement); 
                        setFormData(announcement); 
                        setShowModal(true); 
                      }} 
                      style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(74, 20, 140, 0.7)", 
                        padding: "8px 16px", 
                        border: "1px solid rgba(255, 255, 255, 0.1)", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(94, 30, 160, 0.8)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(74, 20, 140, 0.7)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      }}
                    >
                      <FaEdit style={{ fontSize: "0.9rem" }} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(announcement._id)} 
                      style={{ 
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "rgba(140, 20, 60, 0.7)", 
                        padding: "8px 16px", 
                        border: "1px solid rgba(255, 255, 255, 0.1)", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        color: "#ffffff",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "rgba(160, 30, 80, 0.8)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "rgba(140, 20, 60, 0.7)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      }}
                    >
                      <FaTrash style={{ fontSize: "0.9rem" }} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          background: "rgba(0, 0, 0, 0.7)", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          backdropFilter: "blur(5px)",
          zIndex: 999 
        }}>
          <div style={{ 
            background: "rgba(30, 20, 50, 0.95)", 
            padding: "30px", 
            borderRadius: "8px", 
            width: "500px",
            color: "#ffffff",
            boxShadow: "0 5px 20px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(106, 17, 203, 0.3)"
          }}>
            <h2 style={{ 
              color: "#ffffff", 
              marginBottom: "25px", 
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: "500"
            }}>
              {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              {/* Title Field */}
              <div style={{ marginBottom: "20px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Title
                </label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="Enter announcement title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem"
                  }} 
                />
              </div>

              {/* Description Field */}
              <div style={{ marginBottom: "20px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Description
                </label>
                <textarea 
                  name="description" 
                  placeholder="Enter announcement details" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  style={{ 
                    width: "100%", 
                    height: "120px", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                    resize: "vertical"
                  }} 
                />
              </div>

              {/* Category Field */}
              <div style={{ marginBottom: "20px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Category
                </label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="Company Update">Company Update</option>
                  <option value="Employee Recognition">Employee Recognition</option>
                  <option value="Policy Change">Policy Change</option>
                  <option value="Event Notification">Event Notification</option>
                  <option value="General Information">General Information</option>
                </select>
              </div>

              {/* Priority Field */}
              <div style={{ marginBottom: "20px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Priority
                </label>
                <select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleChange} 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* Visibility Field */}
              <div style={{ marginBottom: "20px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Visibility
                </label>
                <select 
                  name="visibility" 
                  value={formData.visibility} 
                  onChange={handleChange} 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Managers Only">Managers Only</option>
                </select>
              </div>

              {/* Scheduled Date Field */}
              <div style={{ marginBottom: "25px", width: "100%" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "0.9rem",
                  color: "#d0d0d0"
                }}>
                  Scheduled Date
                </label>
                <input 
                  type="date" 
                  name="scheduledDate" 
                  value={formData.scheduledDate} 
                  onChange={handleChange} 
                  required 
                  style={{ 
                    width: "100%", 
                    padding: "10px", 
                    background: "rgba(0, 0, 0, 0.3)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontSize: "0.95rem"
                  }} 
                />
              </div>

              {/* Buttons */}
              <div style={{ 
                display: "flex", 
                gap: "12px",
                width: "100%"
              }}>
                <button 
                  type="submit" 
                  style={{ 
                    flex: 1, 
                    padding: "12px", 
                    background: "rgba(74, 20, 140, 0.8)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontWeight: "500",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(94, 30, 160, 0.9)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(74, 20, 140, 0.8)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  Save
                </button>
                <button 
                  onClick={resetForm} 
                  style={{ 
                    flex: 1, 
                    padding: "12px", 
                    background: "rgba(60, 60, 60, 0.5)", 
                    color: "#ffffff", 
                    border: "1px solid rgba(255, 255, 255, 0.1)", 
                    borderRadius: "4px",
                    fontWeight: "500",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "rgba(80, 80, 80, 0.6)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "rgba(60, 60, 60, 0.5)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpAnnouncements;