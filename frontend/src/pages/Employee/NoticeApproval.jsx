import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaCheck, FaTimes, FaSearch, FaCalendarAlt, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import EmpPanel from "../../components/EmpPanel";

const NoticeApproval = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [noticePeriods, setNoticePeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Configure axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    // Redirect immediately if not admin
    if (storedUser?.role !== 1) {
      navigate("/unauthorized");
      return;
    }

    const fetchNoticePeriods = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/notice-periods", {
          headers: { authorization: `Bearer ${token}` }
        });
        
        // Filter out notices created by the current admin
        const filteredNotices = response.data.filter(
          notice => notice.employeeId?._id !== storedUser._id
        );
        
        setNoticePeriods(filteredNotices);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate("/unauthorized");
        } else {
          setError(err.response?.data?.message || "Failed to load notice periods");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNoticePeriods();
  }, [navigate]);

  const handleApproveReject = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/notice-periods/${id}`,
        { status },
        { headers: { authorization: `Bearer ${token}` } }
      );
      
      setNoticePeriods(prev => prev.map(np => 
        np._id === id ? { ...np, status } : np
      ));
      
      toast.success(`Notice ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredNotices = noticePeriods.filter(notice => 
    notice.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Don't render if not admin
  if (user?.role !== 1) return null;

  if (loading) return <div style={styles.loading}>Loading notices...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.mainContainer}>
      <EmpPanel
        user={{
          username: user?.name || "Unknown User",
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available",
        }}
      />

      <div style={styles.contentContainer}>
        <h1 style={styles.header}>Notice Period Approvals</h1>
        
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search by employee name or status..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch style={styles.searchIcon} />
          </div>
        </div>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.tableHeader}>
              <tr>
                <th style={styles.th}>Employee</th>
                <th style={styles.th}>Resignation Date</th>
                <th style={styles.th}>Last Working Day</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Early Release</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody style={styles.tbody}>
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice) => (
                  <tr key={notice._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <FaUser style={styles.userIcon} />
                        <span>{notice.employeeId?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.dateCell}>
                        <FaCalendarAlt style={styles.calendarIcon} />
                        <span>{formatDate(notice.resignationDate)}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {notice.lastWorkingDay ? formatDate(notice.lastWorkingDay) : "N/A"}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(notice.status === "Approved" ? styles.approvedStatus : 
                             notice.status === "Rejected" ? styles.rejectedStatus : 
                             styles.pendingStatus)
                      }}>
                        {notice.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {notice.isEarlyReleaseRequested ? (
                        <div>
                          <span style={styles.earlyReleaseYes}>Yes</span>
                          {notice.earlyReleaseReason && (
                            <p style={styles.reasonText}>
                              Reason: {notice.earlyReleaseReason}
                            </p>
                          )}
                        </div>
                      ) : "No"}
                    </td>
                    <td style={styles.td}>
                      {notice.status === "Pending" && (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleApproveReject(notice._id, "Approved")}
                            style={styles.approveButton}
                          >
                            <FaCheck style={styles.buttonIcon} /> Approve
                          </button>
                          <button
                            onClick={() => handleApproveReject(notice._id, "Rejected")}
                            style={styles.rejectButton}
                          >
                            <FaTimes style={styles.buttonIcon} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.noResults}>
                    No notice periods found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  mainContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "transparent"
  },
  contentContainer: {
    flex: 1,
    padding: "30px",
    position: "relative",
    overflow: "hidden",
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  },
  header: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "20px",
    textShadow: "0 1px 3px rgba(0,0,0,0.3)"
  },
  loading: {
    textAlign: "center",
    padding: "40px 0",
    fontSize: "18px",
    color: "#ffffff"
  },
  error: {
    textAlign: "center",
    padding: "40px 0",
    color: "#ff6b6b",
    fontSize: "18px"
  },
  searchContainer: {
    marginBottom: "20px",
    position: "relative"
  },
  searchWrapper: {
    position: "relative"
  },
  searchInput: {
    width: "100%",
    padding: "12px 12px 12px 40px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    fontSize: "16px",
    backgroundColor: "rgba(30, 20, 50, 0.7)",
    color: "#ffffff",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.5)"
    }
  },
  searchIcon: {
    position: "absolute",
    left: "15px",
    top: "14px",
    color: "rgba(255, 255, 255, 0.7)"
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
  },
  table: {
    width: "100%",
    backgroundColor: "rgba(30, 20, 50, 0.7)",
    borderCollapse: "collapse",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  tableHeader: {
    backgroundColor: "rgba(74, 20, 140, 0.8)"
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontWeight: "500",
    color: "#ffffff",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
  },
  tbody: {},
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)"
    }
  },
  td: {
    padding: "16px",
    verticalAlign: "middle",
    color: "#e0e0e0"
  },
  userCell: {
    display: "flex",
    alignItems: "center"
  },
  userIcon: {
    marginRight: "10px",
    color: "#a78bfa"
  },
  dateCell: {
    display: "flex",
    alignItems: "center"
  },
  calendarIcon: {
    marginRight: "10px",
    color: "#a78bfa"
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  approvedStatus: {
    backgroundColor: "rgba(72, 187, 120, 0.2)",
    color: "#48bb78"
  },
  rejectedStatus: {
    backgroundColor: "rgba(245, 101, 101, 0.2)",
    color: "#f56565"
  },
  pendingStatus: {
    backgroundColor: "rgba(246, 173, 85, 0.2)",
    color: "#f6ad55"
  },
  earlyReleaseYes: {
    color: "#f56565"
  },
  reasonText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: "4px"
  },
  actionButtons: {
    display: "flex",
    gap: "10px"
  },
  approveButton: {
    backgroundColor: "rgba(72, 187, 120, 0.8)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(56, 161, 105, 0.9)"
    }
  },
  rejectButton: {
    backgroundColor: "rgba(245, 101, 101, 0.8)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(229, 62, 62, 0.9)"
    }
  },
  buttonIcon: {
    marginRight: "6px"
  },
  noResults: {
    textAlign: "center",
    padding: "20px",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "16px"
  }
};

export default NoticeApproval;