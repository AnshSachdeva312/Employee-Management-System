import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaCheck, FaTimes, FaSearch, FaCalendarAlt, 
  FaUser, FaMoneyBillWave, FaFileAlt, FaInfoCircle 
} from "react-icons/fa";
import { toast } from "react-toastify";
import EmpPanel from "../../components/EmpPanel";

const AdminLoanApproval = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [comments, setComments] = useState("");

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

    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/api/loans/for-approval", {
          headers: { authorization: `Bearer ${token}` }
        });
        
        // Filter out loans created by the current admin
        const filteredLoans = response.data.loans.filter(
          loan => loan.employeeId?._id !== storedUser._id
        );
        
        setLoans(filteredLoans);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate("/unauthorized");
        } else {
          setError(err.response?.data?.message || "Failed to load loans");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [navigate]);

  const handleApproveReject = async (action) => {
    if (!selectedLoan) return;
    
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/api/loans/${selectedLoan._id}/process`,
        { action, comments },
        { headers: { authorization: `Bearer ${token}` } }
      );
      
      setLoans(prev => prev.map(loan => 
        loan._id === selectedLoan._id ? { ...loan, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : loan
      ));
      
      toast.success(`Loan ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      setSelectedLoan(null);
      setComments("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update loan status");
    }
  };

  const filteredLoans = loans.filter(loan => 
    loan.status === 'SUBMITTED' && (
      loan.employeeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanType?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Don't render if not admin
  if (user?.role !== 1) return null;

  if (loading) return <div style={styles.loading}>Loading loans...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.mainContainer}>
      <EmpPanel
        user={{
          username: user?.name || "Admin",
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available",
        }}
      />

      <div style={styles.contentContainer}>
        <h1 style={styles.header}>Loan Application Approvals</h1>
        
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search by employee name or loan type..."
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
                <th style={styles.th}>Loan Type</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Period (Months)</th>
                <th style={styles.th}>Purpose</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody style={styles.tbody}>
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => (
                  <tr key={loan._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <FaUser style={styles.userIcon} />
                        <span>{loan.employeeId?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.loanTypeCell}>
                        <FaFileAlt style={styles.fileIcon} />
                        <span>{loan.loanType}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.amountCell}>
                        <FaMoneyBillWave style={styles.moneyIcon} />
                        <span>${loan.amount}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      {loan.repaymentPeriod}
                    </td>
                    <td style={styles.td}>
                      {loan.purpose}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(loan.status === "APPROVED" ? styles.approvedStatus : 
                             loan.status === "REJECTED" ? styles.rejectedStatus : 
                             styles.pendingStatus)
                      }}>
                        {loan.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {loan.status === "SUBMITTED" && (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => setSelectedLoan(loan)}
                            style={styles.detailsButton}
                          >
                            <FaInfoCircle style={styles.buttonIcon} /> Review
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={styles.noResults}>
                    No loans pending approval
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Approval Modal */}
        {selectedLoan && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2 style={styles.modalHeader}>Review Loan Application</h2>
              
              <div style={styles.loanDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Employee:</span>
                  <span style={styles.detailValue}>
                    {selectedLoan.employeeId?.name || "Unknown"}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Loan Type:</span>
                  <span style={styles.detailValue}>{selectedLoan.loanType}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Amount:</span>
                  <span style={styles.detailValue}>${selectedLoan.amount}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Repayment Period:</span>
                  <span style={styles.detailValue}>{selectedLoan.repaymentPeriod} months</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Purpose:</span>
                  <span style={styles.detailValue}>{selectedLoan.purpose}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Submitted On:</span>
                  <span style={styles.detailValue}>{formatDate(selectedLoan.createdAt)}</span>
                </div>
              </div>

              <div style={styles.commentSection}>
                <label style={styles.commentLabel}>Comments:</label>
                <textarea
                  style={styles.commentInput}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter approval/rejection comments..."
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => handleApproveReject('APPROVE')}
                  style={styles.approveButton}
                >
                  <FaCheck style={styles.buttonIcon} /> Approve
                </button>
                <button
                  onClick={() => handleApproveReject('REJECT')}
                  style={styles.rejectButton}
                >
                  <FaTimes style={styles.buttonIcon} /> Reject
                </button>
                <button
                  onClick={() => setSelectedLoan(null)}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
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
  loanTypeCell: {
    display: "flex",
    alignItems: "center"
  },
  fileIcon: {
    marginRight: "10px",
    color: "#a78bfa"
  },
  amountCell: {
    display: "flex",
    alignItems: "center"
  },
  moneyIcon: {
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
  actionButtons: {
    display: "flex",
    gap: "10px"
  },
  detailsButton: {
    backgroundColor: "rgba(106, 17, 203, 0.7)",
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
      backgroundColor: "rgba(106, 17, 203, 0.9)"
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
    borderRadius: "8px",
    width: "600px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    border: "1px solid rgba(106, 17, 203, 0.5)",
    backdropFilter: "blur(8px)"
  },
  modalHeader: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: "20px",
    textAlign: "center"
  },
  loanDetails: {
    marginBottom: "20px",
    padding: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  detailRow: {
    display: "flex",
    marginBottom: "12px",
    ":last-child": {
      marginBottom: 0
    }
  },
  detailLabel: {
    fontWeight: "500",
    width: "160px",
    color: "#a78bfa",
    fontSize: "14px"
  },
  detailValue: {
    flex: 1,
    color: "#e0e0e0",
    fontSize: "14px"
  },
  commentSection: {
    marginBottom: "20px"
  },
  commentLabel: {
    display: "block",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#a78bfa",
    fontSize: "14px"
  },
  commentInput: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    color: "#ffffff",
    "::placeholder": {
      color: "rgba(255, 255, 255, 0.5)"
    }
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px"
  },
  approveButton: {
    backgroundColor: "rgba(72, 187, 120, 0.8)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(56, 161, 105, 0.9)"
    }
  },
  rejectButton: {
    backgroundColor: "rgba(245, 101, 101, 0.8)",
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(229, 62, 62, 0.9)"
    }
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    padding: "10px 20px",
    borderRadius: "6px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)"
    }
  }
};

export default AdminLoanApproval;