import { useEffect, useState } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { FaCalendarAlt, FaInfoCircle, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

const EmpNoticePeriod = () => {
  const [user, setUser] = useState(null);
  const [noticePeriod, setNoticePeriod] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    resignationDate: "",
    noticePeriodDays: 30,
    isEarlyReleaseRequested: false,
    earlyReleaseReason: "",
    comments: ""
  });

  // Configure axios instance
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
    withCredentials: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = JSON.parse(localStorage.getItem("user"));
        
        if (storedUser) {
          setUser(storedUser);
        }

        // Get notice period for current employee
        const response = await api.get(
          `/api/notice-periods/employee/${storedUser._id}`,
          { headers: { authorization: `Bearer ${token}` } }
        );
        
        setNoticePeriod(response.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // No notice exists yet - this is normal
          setNoticePeriod(null);
        } else {
          setError(err.response?.data?.message || "Failed to load notice period data");
          console.error("Error details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const submitNotice = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Basic validation
      if (!formData.resignationDate) {
        alert("Please select your resignation date");
        return;
      }
  
      // Prepare the request data with all required fields
      const requestData = {
        resignationDate: new Date(formData.resignationDate).toISOString(),
        noticePeriodDays: Number(formData.noticePeriodDays),
        isEarlyReleaseRequested: formData.isEarlyReleaseRequested,
        earlyReleaseReason: formData.isEarlyReleaseRequested ? formData.earlyReleaseReason : "",
        comments: formData.comments || "",
        employeeId: user._id,
        clearance: {
          it: false,
          hr: false,
          finance: false,
          admin: false
        }
      };
  
      const response = await api.post(
        "/api/notice-periods",
        requestData,
        { headers: { authorization: `Bearer ${token}` } }
      );
  
      setNoticePeriod(response.data);
      setShowModal(false);
      alert("Notice period submitted successfully!");
    } catch (error) {
      console.error("Full error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to submit notice");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysLeft = (endDate) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date();
    const lastDay = new Date(endDate);
    return Math.round(Math.abs((lastDay - today) / oneDay));
  };

  if (loading) return <div style={styles.loading}>Loading notice period information...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <EmpPanel
        user={{
          username: user?.name || "Unknown User",
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available",
        }}
      />

      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Notice Period Management</h1>
          {!noticePeriod && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              style={styles.submitButton}
            >
              Submit Resignation Notice
            </motion.button>
          )}
        </div>

        {noticePeriod ? (
          <>
            {/* Notice Period Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.section}
            >
              <h2 style={styles.sectionTitle}>Your Notice Period Details</h2>
              <div style={styles.detailsGrid}>
                <div style={styles.detailCard}>
                  <FaCalendarAlt style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Resignation Date</p>
                    <p style={styles.detailValue}>{formatDate(noticePeriod.resignationDate)}</p>
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <FaCalendarAlt style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Last Working Day</p>
                    <p style={styles.detailValue}>{formatDate(noticePeriod.lastWorkingDay)}</p>
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <FaInfoCircle style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Status</p>
                    <p style={{
                      ...styles.detailValue,
                      color: noticePeriod.status === 'Approved' ? '#48BB78' :
                            noticePeriod.status === 'Rejected' ? '#F56565' : '#ECC94B'
                    }}>
                      {noticePeriod.status}
                    </p>
                  </div>
                </div>
                <div style={styles.detailCard}>
                  <FaUser style={styles.detailIcon} />
                  <div>
                    <p style={styles.detailLabel}>Days Remaining</p>
                    <p style={styles.detailValue}>
                      {calculateDaysLeft(noticePeriod.lastWorkingDay)} days
                    </p>
                  </div>
                </div>
              </div>

              {noticePeriod.isEarlyReleaseRequested && (
                <div style={styles.earlyReleaseNotice}>
                  <h3 style={styles.earlyReleaseTitle}>Early Release Requested</h3>
                  <p style={styles.earlyReleaseText}>
                    <strong>Reason:</strong> {noticePeriod.earlyReleaseReason || "Not specified"}
                  </p>
                  <p style={styles.earlyReleaseText}>
                    <strong>Status:</strong> {noticePeriod.earlyReleaseStatus || "Pending"}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Clearance Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={styles.section}
            >
              <h2 style={styles.sectionTitle}>Exit Clearance Status</h2>
              <div style={styles.clearanceGrid}>
                {Object.entries(noticePeriod.clearance).map(([dept, status]) => (
                  <div key={dept} style={styles.clearanceCard}>
                    <div style={styles.clearanceHeader}>
                      <div style={{
                        ...styles.statusIndicator,
                        backgroundColor: status ? '#48BB78' : '#F56565'
                      }}></div>
                      <h3 style={styles.clearanceTitle}>
                        {dept.toUpperCase()} Department
                      </h3>
                    </div>
                    <div style={styles.clearanceStatus}>
                      {status ? (
                        <>
                          <FaCheck style={{ color: '#48BB78', marginRight: '5px' }} />
                          <span>Clearance Complete</span>
                        </>
                      ) : (
                        <>
                          <FaTimes style={{ color: '#F56565', marginRight: '5px' }} />
                          <span>Pending Clearance</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Comments */}
            {noticePeriod.comments && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={styles.section}
              >
                <h2 style={styles.sectionTitle}>Additional Information</h2>
                <div style={styles.notesBox}>
                  {noticePeriod.comments}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div style={styles.noNotice}>
            <h2 style={styles.noNoticeTitle}>No Active Notice Period</h2>
            <p style={styles.noNoticeText}>
              You currently don't have an active notice period. Submit your resignation notice to begin the process.
            </p>
          </div>
        )}

        {/* Submit Notice Modal */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={styles.modalContent}
            >
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Submit Resignation Notice</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  style={styles.modalClose}
                >
                  ×
                </button>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Resignation Date</label>
                <input
                  type="date"
                  name="resignationDate"
                  value={formData.resignationDate}
                  onChange={handleInputChange}
                  style={styles.formInput}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Notice Period (Days)</label>
                <select
                  name="noticePeriodDays"
                  value={formData.noticePeriodDays}
                  onChange={handleInputChange}
                  style={styles.formInput}
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days (Standard)</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="isEarlyReleaseRequested"
                    checked={formData.isEarlyReleaseRequested}
                    onChange={handleInputChange}
                    style={styles.checkboxInput}
                  />
                  Request Early Release
                </label>
              </div>

              {formData.isEarlyReleaseRequested && (
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Early Release Reason</label>
                  <textarea
                    name="earlyReleaseReason"
                    value={formData.earlyReleaseReason}
                    onChange={handleInputChange}
                    style={styles.formTextarea}
                    placeholder="Explain why you're requesting early release..."
                  />
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Additional Information</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  style={styles.formTextarea}
                  placeholder="Add any important information for HR..."
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={submitNotice}
                  style={styles.submitModalButton}
                >
                  Submit Notice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "transparent"
  },
  content: {
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  submitButton: {
    padding: "12px 24px",
    backgroundColor: "rgba(74, 20, 140, 0.8)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(94, 30, 160, 0.9)"
    }
  },
  section: {
    backgroundColor: "rgba(30, 20, 50, 0.7)",
    borderRadius: "12px",
    padding: "25px",
    marginBottom: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    border: "1px solid rgba(106, 17, 203, 0.5)",
    backdropFilter: "blur(8px)"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#a78bfa",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  },
  detailCard: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    borderLeft: "4px solid #a78bfa"
  },
  detailIcon: {
    fontSize: "24px",
    color: "#a78bfa"
  },
  detailLabel: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.7)",
    margin: 0,
    marginBottom: "5px"
  },
  detailValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  earlyReleaseNotice: {
    backgroundColor: "rgba(221, 107, 32, 0.1)",
    borderLeft: "4px solid #dd6b20",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px"
  },
  earlyReleaseTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#dd6b20",
    margin: "0 0 10px 0"
  },
  earlyReleaseText: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "5px 0"
  },
  clearanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px"
  },
  clearanceCard: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  clearanceHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px"
  },
  statusIndicator: {
    width: "12px",
    height: "12px",
    borderRadius: "50%"
  },
  clearanceTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  clearanceStatus: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.8)",
    margin: "0 0 15px 0",
    display: "flex",
    alignItems: "center"
  },
  notesBox: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid #48BB78",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: "1.6"
  },
  noNotice: {
    textAlign: "center",
    padding: "40px",
    backgroundColor: "rgba(30, 20, 50, 0.7)",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    border: "1px solid rgba(106, 17, 203, 0.5)"
  },
  noNoticeTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "10px"
  },
  noNoticeText: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.8)",
    maxWidth: "600px",
    margin: "0 auto"
  },
  modalOverlay: {
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
  },
  modalContent: {
    backgroundColor: "rgba(30, 20, 50, 0.95)",
    borderRadius: "12px",
    width: "500px",
    maxWidth: "90%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    padding: "25px",
    border: "1px solid rgba(106, 17, 203, 0.5)",
    backdropFilter: "blur(8px)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "rgba(255, 255, 255, 0.7)",
    ":hover": {
      color: "#ffffff"
    }
  },
  formGroup: {
    marginBottom: "20px"
  },
  formLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#a78bfa",
    marginBottom: "8px"
  },
  formInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.5)"
    }
  },
  formTextarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.5)"
    }
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#ffffff",
    cursor: "pointer"
  },
  checkboxInput: {
    width: "16px",
    height: "16px",
    accentColor: "#a78bfa"
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "20px"
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)"
    }
  },
  submitModalButton: {
    padding: "10px 20px",
    backgroundColor: "rgba(74, 20, 140, 0.8)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(94, 30, 160, 0.9)"
    }
  },
  loading: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: "#ffffff"
  },
  error: {
    textAlign: "center",
    padding: "50px",
    fontSize: "18px",
    color: "#F56565"
  }
};

export default EmpNoticePeriod;