import { useEffect, useState } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { FaEdit, FaTrash } from "react-icons/fa";

const EmpMeeting = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [meetingData, setMeetingData] = useState({
    title: "",
    agenda: "",
    date: "",
    time: "",
    participants: [],
    link: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/auth/all", {
        headers: { authorization: `Bearer ${token}` },
      });
      setUsers(response.data.filter((u) => u._id !== user?._id));
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/api/meetings", {
        headers: { authorization: `Bearer ${token}` },
      });
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchMeetings();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingData({ ...meetingData, [name]: value });
  };

  const handleParticipantChange = (userId, isChecked) => {
    setMeetingData((prev) => ({
      ...prev,
      participants: isChecked
        ? [...prev.participants, userId]
        : prev.participants.filter((id) => id !== userId),
    }));
  };

  const resetForm = () => {
    setMeetingData({
      title: "",
      agenda: "",
      date: "",
      time: "",
      participants: [],
      link: "",
    });
    setEditingMeeting(null);
  };

  const createMeeting = async () => {
    try {
      if (!meetingData.title || !meetingData.agenda || !meetingData.date || !meetingData.time) {
        alert("Please fill all required fields");
        return;
      }
  
      const meetingDate = new Date(meetingData.date);
      if (isNaN(meetingDate.getTime())) {
        alert("Please enter a valid date");
        return;
      }
  
      if (meetingData.participants.length === 0) {
        alert("Please select at least one participant");
        return;
      }
  
      const token = localStorage.getItem("token");
      const endpoint = editingMeeting
        ? `http://localhost:3000/api/meetings/${editingMeeting._id}`
        : "http://localhost:3000/api/meetings";
  
      const method = editingMeeting ? "put" : "post";
  
      const response = await axios[method](endpoint, {
        title: meetingData.title,
        agenda: meetingData.agenda,
        date: meetingDate,
        time: meetingData.time,
        link: meetingData.link,
        participants: meetingData.participants,
        createdBy: user._id
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      setShowModal(false);
      resetForm();
      fetchMeetings();
      alert(editingMeeting ? "Meeting updated successfully!" : "Meeting created successfully!");
  
    } catch (error) {
      console.error("Error saving meeting", error);
      console.log("Full error response:", error.response?.data);
      alert(error.response?.data?.error || error.message || "Failed to save meeting");
    }
  };

  const editMeeting = (meeting) => {
    setMeetingData({
      title: meeting.title,
      agenda: meeting.agenda,
      date: meeting.date.split("T")[0],
      time: meeting.time,
      participants: meeting.participants.map((p) => p._id || p),
      link: meeting.link,
    });
    setEditingMeeting(meeting);
    setShowModal(true);
  };

  const deleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/meetings/${meetingId}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "transparent" }}>
      <EmpPanel
        user={{
          username: user?.name || "Unknown User",
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available",
        }}
      />

      <div
        style={{
          width: "100%",
          padding: "30px",
          overflowY: "auto",
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#ffffff" }}>
            Meeting Management
          </h1>
          {user?.role === 1 && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: "rgba(74, 20, 140, 0.8)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                margin: "10px auto 0",
                transition: "all 0.3s ease",
                ":hover": {
                  backgroundColor: "rgba(94, 30, 160, 0.9)"
                }
              }}
            >
              <span style={{ fontSize: "16px" }}>+</span> New Meeting
            </button>
          )}
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#ffffff",
                marginRight: "15px",
              }}
            >
              Upcoming Meetings
            </h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.2)" }}></div>
          </div>

          {meetings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              No meetings scheduled yet
            </div>
          ) : (
            meetings.map((meeting) => (
              <div
                key={meeting._id}
                style={{
                  width: "600px",
                  backgroundColor: "rgba(30, 20, 50, 0.7)",
                  borderRadius: "8px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid rgba(106, 17, 203, 0.5)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  backdropFilter: "blur(8px)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#a78bfa",
                        marginBottom: "5px",
                      }}
                    >
                      {meeting.title}
                    </h3>
                    <p style={{ color: "#e0e0e0", marginBottom: "10px" }}>
                      {formatDate(meeting.date)} at {meeting.time}
                    </p>
                    <p style={{ color: "#e0e0e0", marginBottom: "10px" }}>
                      <span style={{ fontWeight: "500", color: "#a78bfa" }}>Agenda:</span> {meeting.agenda}
                    </p>
                    <p style={{ color: "#e0e0e0", marginBottom: "10px" }}>
                      <span style={{ fontWeight: "500", color: "#a78bfa" }}>Created by:</span> {meeting.createdBy?.name || "Admin"}
                    </p>
                    {meeting.link && (
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#a78bfa",
                          textDecoration: "underline",
                          display: "inline-block",
                          marginTop: "5px",
                        }}
                      >
                        Join Meeting
                      </a>
                    )}
                  </div>

                  {user?.role === 1 && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => editMeeting(meeting)} 
                        style={{ 
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(74, 20, 140, 0.7)", 
                          padding: "8px 15px", 
                          border: "1px solid rgba(255, 255, 255, 0.2)", 
                          borderRadius: "6px", 
                          cursor: "pointer", 
                          color: "#ffffff",
                          fontSize: "0.9rem",
                          transition: "all 0.3s ease",
                          ":hover": {
                            background: "rgba(94, 30, 160, 0.8)"
                          }
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button 
                        onClick={() => deleteMeeting(meeting._id)} 
                        style={{ 
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          background: "rgba(140, 20, 60, 0.7)", 
                          padding: "8px 15px", 
                          border: "1px solid rgba(255, 255, 255, 0.2)", 
                          borderRadius: "6px", 
                          cursor: "pointer", 
                          color: "#ffffff",
                          fontSize: "0.9rem",
                          transition: "all 0.3s ease",
                          ":hover": {
                            background: "rgba(160, 30, 80, 0.8)"
                          }
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {meeting.participants.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "rgba(255, 255, 255, 0.7)",
                        marginBottom: "5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Participants
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {meeting.participants.map((participant) => (
                        <span
                          key={participant._id || participant}
                          style={{
                            backgroundColor: "rgba(106, 17, 203, 0.3)",
                            color: "#a78bfa",
                            fontSize: "12px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(167, 139, 250, 0.3)"
                          }}
                        >
                          {typeof participant === "object"
                            ? participant.name
                            : users.find((u) => u._id === participant)?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div
            style={{
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
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(30, 20, 50, 0.95)",
                borderRadius: "8px",
                padding: "25px",
                width: "500px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                border: "1px solid rgba(106, 17, 203, 0.5)",
                backdropFilter: "blur(8px)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#ffffff",
                  }}
                >
                  {editingMeeting ? "Edit Meeting" : "Create New Meeting"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: "rgba(255, 255, 255, 0.7)",
                    ":hover": {
                      color: "#ffffff"
                    }
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#a78bfa",
                    marginBottom: "8px",
                  }}
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={meetingData.title}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    color: "#ffffff",
                    "::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)"
                    }
                  }}
                  placeholder="Meeting title"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#a78bfa",
                    marginBottom: "8px",
                  }}
                >
                  Agenda
                </label>
                <input
                  type="text"
                  name="agenda"
                  value={meetingData.agenda}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    color: "#ffffff",
                    "::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)"
                    }
                  }}
                  placeholder="Meeting agenda"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#a78bfa",
                      marginBottom: "8px",
                    }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={meetingData.date}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      color: "#ffffff"
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#a78bfa",
                      marginBottom: "8px",
                    }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={meetingData.time}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      fontSize: "14px",
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      color: "#ffffff"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#a78bfa",
                    marginBottom: "8px",
                  }}
                >
                  Meeting Link
                </label>
                <input
                  type="text"
                  name="link"
                  value={meetingData.link}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    color: "#ffffff",
                    "::placeholder": {
                      color: "rgba(255, 255, 255, 0.5)"
                    }
                  }}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#a78bfa",
                    marginBottom: "8px",
                  }}
                >
                  Participants
                </label>
                <div
                  style={{
                    maxHeight: "150px",
                    overflowY: "auto",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    padding: "10px",
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {users.map((u) => (
                    <label
                      key={u._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "8px 5px",
                        cursor: "pointer",
                        color: "#e0e0e0"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={meetingData.participants.includes(u._id)}
                        onChange={(e) =>
                          handleParticipantChange(u._id, e.target.checked)
                        }
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                          accentColor: "#a78bfa"
                        }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {u.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    ":hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.2)"
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={createMeeting}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "rgba(74, 20, 140, 0.8)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    ":hover": {
                      backgroundColor: "rgba(94, 30, 160, 0.9)"
                    }
                  }}
                >
                  {editingMeeting ? "Update Meeting" : "Create Meeting"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpMeeting;