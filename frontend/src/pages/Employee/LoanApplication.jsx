import React, { useEffect, useState } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { FaMoneyBillWave, FaCalendarAlt, FaFileAlt, FaCheckCircle } from "react-icons/fa";

// Configure axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true
});

const LoanApplication = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loanData, setLoanData] = useState({
    loanType: "PERSONAL",
    amount: "",
    purpose: "",
    repaymentPeriod: 12,
    documents: []
  });
  const [emiDetails, setEmiDetails] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/loans/my-loans", {
        headers: { authorization: `Bearer ${token}` },
      });
      
      setLoans(response.data?.loans || []);
    } catch (error) {
      console.error("Error fetching loans", error);
      setError(error.response?.data?.message || "Failed to load loan applications");
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanData({ ...loanData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const resetForm = () => {
    setLoanData({
      loanType: "PERSONAL",
      amount: "",
      purpose: "",
      repaymentPeriod: 12,
      documents: []
    });
    setEmiDetails(null);
    setFile(null);
  };

  const calculateEMI = () => {
    if (!loanData.amount || !loanData.repaymentPeriod) {
      setError("Please enter amount and repayment period");
      return;
    }

    const principal = parseFloat(loanData.amount);
    const term = parseInt(loanData.repaymentPeriod);
    const emi = principal / term;
    
    setEmiDetails({
      emi: emi.toFixed(2),
      totalPayment: principal.toFixed(2),
      repaymentPeriod: term
    });
  };

  const uploadDocument = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!loanData._id) {
      setError("Please save the loan application first before uploading documents");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);

    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        `/api/loans/${loanData._id}/documents`,
        formData,
        {
          headers: { 
            authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setLoanData(prev => ({
        ...prev,
        documents: [...prev.documents, {
          path: response.data.document.path,
          originalName: response.data.document.originalName
        }]
      }));
      setSuccess("Document uploaded successfully");
      setFile(null);
    } catch (error) {
      console.error("Error uploading document", error);
      setError(error.response?.data?.message || "Failed to upload document");
    }
  };

  const submitLoan = async () => {
    try {
      // Basic validation
      if (!loanData.amount || !loanData.purpose || !loanData.repaymentPeriod) {
        setError("Please fill all required fields");
        return;
      }
  
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found");
        return;
      }
  
      const requestData = {
        loanType: loanData.loanType,
        amount: parseFloat(loanData.amount),
        purpose: loanData.purpose,
        repaymentPeriod: parseInt(loanData.repaymentPeriod),
        emiDetails: emiDetails
      };
  
      const response = await api.post(
        "/api/loans",
        requestData,
        {
          headers: { 
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Match the backend response structure
      setLoanData(prev => ({ ...prev, _id: response.data.loan._id }));
  
      setShowModal(false);
      resetForm();
      fetchLoans();
      setSuccess("Loan submitted successfully!");
  
    } catch (error) {
      console.error("Loan submission error:", error);
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error || 
                      error.message || 
                      "Failed to process loan application";
      setError(errorMsg);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      DRAFT: { backgroundColor: "rgba(226, 232, 240, 0.8)", color: "#4A5568" },
      SUBMITTED: { backgroundColor: "rgba(254, 243, 199, 0.8)", color: "#92400E" },
      APPROVED: { backgroundColor: "rgba(209, 250, 229, 0.8)", color: "#065F46" },
      REJECTED: { backgroundColor: "rgba(254, 226, 226, 0.8)", color: "#991B1B" },
      DISBURSED: { backgroundColor: "rgba(219, 234, 254, 0.8)", color: "#1E40AF" }
    };

    return (
      <span style={{
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        ...statusStyles[status]
      }}>
        {status}
      </span>
    );
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

      <div style={{ width:"100%", padding: "30px", overflowY: "auto", 
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#ffffff" }}>
            Loan Application
          </h1>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(49, 130, 206, 0.8)",
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
            }}
          >
            <span style={{ fontSize: "16px" }}>+</span> New Loan Application
          </button>
        </div>

        {error && (
          <div style={{
            padding: "10px",
            backgroundColor: "rgba(254, 226, 226, 0.8)",
            color: "#991B1B",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{error}</span>
            <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B" }}>
              ×
            </button>
          </div>
        )}

        {success && (
          <div style={{
            padding: "10px",
            backgroundColor: "rgba(209, 250, 229, 0.8)",
            color: "#065F46",
            borderRadius: "6px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>{success}</span>
            <button onClick={() => setSuccess("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#065F46" }}>
              ×
            </button>
          </div>
        )}

        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#ffffff", marginRight: "15px" }}>
              My Loan Applications
            </h2>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.2)" }}></div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.8)" }}>
              <p>Loading loan applications...</p>
            </div>
          ) : loans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.7)" }}>
              No loan applications found
            </div>
          ) : (
            loans.map((loan) => (
              <div
                key={loan._id}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  backdropFilter: "blur(5px)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#63B3ED" }}>
                      {loan.loanType} Loan
                    </h3>
                    {getStatusBadge(loan.status)}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "500" }}>Amount:</span> ${loan.amount}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "500" }}>Purpose:</span> {loan.purpose}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "500" }}>Repayment:</span> {loan.repaymentPeriod} months
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                    <span style={{ fontWeight: "500" }}>Applied on:</span> {formatDate(loan.createdAt)}
                  </p>
                  {loan.emiDetails && (
                    <p style={{ color: "rgba(255,255,255,0.8)", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "500" }}>Monthly EMI:</span> ${loan.emiDetails.emi}
                    </p>
                  )}
                </div>

                {loan.documents && loan.documents.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,0.6)", marginBottom: "5px", textTransform: "uppercase" }}>
                      Supporting Documents
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {loan.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={`${api.defaults.baseURL}/api/loans/${loan._id}/documents/${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: "rgba(45, 55, 72, 0.6)",
                            color: "#90CDF4",
                            fontSize: "12px",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                          }}
                        >
                          <FaFileAlt size={10} />
                          {doc.originalName || `Document ${index + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
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
        New Loan Application
      </h2>
      
      <div style={{ width: "100%" }}>
        {/* Loan Type Field */}
        <div style={{ marginBottom: "20px", width: "100%" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "0.9rem",
            color: "#d0d0d0"
          }}>
            Loan Type
          </label>
          <select
            name="loanType"
            value={loanData.loanType}
            onChange={handleInputChange}
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
            <option value="PERSONAL">Personal Loan</option>
            <option value="EMERGENCY">Emergency Loan</option>
            <option value="EDUCATION">Education Loan</option>
            <option value="HOUSING">Housing Loan</option>
          </select>
        </div>

        {/* Amount Field */}
        <div style={{ marginBottom: "20px", width: "100%" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "0.9rem",
            color: "#d0d0d0"
          }}>
            Loan Amount ($)
          </label>
          <input
            type="number"
            name="amount"
            value={loanData.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
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

        {/* Purpose Field */}
        <div style={{ marginBottom: "20px", width: "100%" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "0.9rem",
            color: "#d0d0d0"
          }}>
            Purpose
          </label>
          <textarea
            name="purpose"
            value={loanData.purpose}
            onChange={handleInputChange}
            placeholder="Describe the purpose of the loan"
            style={{ 
              width: "100%", 
              height: "100px", 
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

        {/* Repayment Period Field */}
        <div style={{ marginBottom: "20px", width: "100%" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "0.9rem",
            color: "#d0d0d0"
          }}>
            Repayment Period (months)
          </label>
          <select
            name="repaymentPeriod"
            value={loanData.repaymentPeriod}
            onChange={handleInputChange}
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
            {[6, 12, 18, 24, 30, 36].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        {/* EMI Calculation Button */}
        <div style={{ marginBottom: "20px", width: "100%" }}>
          <button
            onClick={calculateEMI}
            style={{ 
              width: "100%", 
              padding: "12px", 
              background: "rgba(74, 20, 140, 0.8)", 
              color: "#ffffff", 
              border: "1px solid rgba(255, 255, 255, 0.1)", 
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
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
            <FaMoneyBillWave /> Calculate EMI
          </button>
        </div>

        {/* EMI Details Display */}
        {emiDetails && (
          <div style={{ 
            marginBottom: "20px", 
            padding: "15px", 
            background: "rgba(0, 0, 0, 0.3)", 
            borderRadius: "4px",
            border: "1px solid rgba(106, 17, 203, 0.3)"
          }}>
            <h4 style={{ 
              fontSize: "1rem", 
              fontWeight: "500", 
              color: "#ffffff", 
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <FaMoneyBillWave /> EMI Calculation
            </h4>
            <div style={{ display: "flex", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "0.9rem", color: "#d0d0d0", marginBottom: "5px" }}>Monthly Payment</p>
                <p style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff" }}>${emiDetails.emi}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", color: "#d0d0d0", marginBottom: "5px" }}>Total Payment</p>
                <p style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff" }}>${emiDetails.totalPayment}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", color: "#d0d0d0", marginBottom: "5px" }}>Period</p>
                <p style={{ fontSize: "1rem", fontWeight: "500", color: "#ffffff" }}>{emiDetails.repaymentPeriod} months</p>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload */}
        <div style={{ marginBottom: "25px", width: "100%" }}>
          <label style={{ 
            display: "block", 
            marginBottom: "8px", 
            fontSize: "0.9rem",
            color: "#d0d0d0"
          }}>
            Supporting Documents
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="file"
              id="document-upload"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <label
              htmlFor="document-upload"
              style={{
                flex: 1,
                padding: "10px",
                background: "rgba(0, 0, 0, 0.3)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.4)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.3)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <FaFileAlt /> Choose File
            </label>
            <button
              onClick={uploadDocument}
              disabled={!file || !loanData._id}
              style={{
                padding: "10px",
                background: "rgba(74, 20, 140, 0.8)",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                fontWeight: "500",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: (file && loanData._id) ? 1 : 0.5,
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                if (file && loanData._id) {
                  e.target.style.background = "rgba(94, 30, 160, 0.9)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseOut={(e) => {
                if (file && loanData._id) {
                  e.target.style.background = "rgba(74, 20, 140, 0.8)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              <FaCheckCircle /> Upload
            </button>
          </div>
          {file && (
            <p style={{ 
              marginTop: "8px", 
              fontSize: "0.85rem", 
              color: "#d0d0d0",
              fontStyle: "italic"
            }}>
              Selected: {file.name}
            </p>
          )}
          {loanData.documents.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <p style={{ fontSize: "0.85rem", color: "#d0d0d0", marginBottom: "5px" }}>Uploaded:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {loanData.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={`${api.defaults.baseURL}/api/loans/${loanData._id}/documents/${index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "4px 10px",
                      background: "rgba(106, 17, 203, 0.3)",
                      color: "#ffffff",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      border: "1px solid rgba(106, 17, 203, 0.5)"
                    }}
                  >
                    <FaFileAlt size={10} /> {doc.originalName || `Document ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "12px",
          width: "100%"
        }}>
          <button 
            onClick={submitLoan}
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
            Submit Application
          </button>
          <button 
            onClick={() => { setShowModal(false); resetForm(); }}
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
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default LoanApplication;