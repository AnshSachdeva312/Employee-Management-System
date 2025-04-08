import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave, FaCalendarCheck, FaBell, FaComments, FaBullhorn,
  FaChartBar, FaTasks, FaExclamationTriangle, FaFileInvoiceDollar,
  FaUsers, FaClock, FaUserShield, FaBriefcase, FaClipboardCheck
} from "react-icons/fa";

export default function EmpPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("Loaded user from localStorage:", parsedUser);
          
          if (!parsedUser) {
            throw new Error("Invalid user data in localStorage");
          }

          setUser(parsedUser);
          setImage(parsedUser.image || null);
          setIsAdmin(parsedUser.role === 1 || parsedUser.role === "1");
        } else {
          console.warn("No user data found in localStorage");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({
          name: "User",
          email: "user@example.com",
          phone: "No phone number",
          role: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Base options for all users
  const baseOptions = [
    { name: "Announcements", icon: <FaBullhorn />, path: "/announcements" },
    { name: "Position", icon: <FaBriefcase />, path: "/position" },
    { name: "Attendance", icon: <FaCalendarCheck />, path: "/attendance" },
    { name: "Notice Period", icon: <FaBell />, path: "/notice-period" },
    { name: "Task", icon: <FaTasks />, path: "/tasks" },
    { name: "Loan Application", icon: <FaFileInvoiceDollar />, path: "/loan-application" },
    { name: "Meetings", icon: <FaUsers />, path: "/meeting" }
  ];

  // Admin-only options
  const adminOptions = [
    { name: "Loan Approvals", icon: <FaUserShield />, path: "/admin/loan-approvals" },
    { name: "Notice Approvals", icon: <FaClipboardCheck />, path: "/admin/notice-approvals" }
  ];

  // Combine options based on admin status
  const options = isAdmin ? [...baseOptions, ...adminOptions] : baseOptions;

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.loadingText}>Loading user data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Profile Image Section */}
      <div style={styles.profileImage}>
        {image ? (
          <img 
            src={image} 
            alt="Profile" 
            style={styles.profileImg} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "";
              setImage(null);
            }}
          />
        ) : (
          <div style={styles.noImage}>
            <p style={styles.noImageText}>No Profile Image</p>
          </div>
        )}
      </div>

      {/* User Details */}
      <div style={styles.userDetails}>
        <p style={styles.username}>{user?.name || "User"}</p>
        <p style={styles.userInfo}>{user?.email || "user@example.com"}</p>
        <p style={styles.userInfo}>{user?.phone || "No phone number"}</p>
        {isAdmin && (
          <p style={styles.adminBadge}>
            ADMIN
          </p>
        )}
      </div>

      <hr style={styles.divider} />

      {/* Navigation Options */}
      <ul style={styles.navList}>
        {options.map((option) => (
          <li
            key={option.name}
            style={styles.navItem}
            onClick={() => navigate(option.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.navItemHover.background;
              e.currentTarget.style.boxShadow = styles.navItemHover.boxShadow;
              e.currentTarget.style.transform = styles.navItemHover.transform;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = styles.navItem.background;
              e.currentTarget.style.boxShadow = styles.navItem.boxShadow;
              e.currentTarget.style.transform = styles.navItem.transform;
            }}
          >
            <span style={styles.navIcon}>{option.icon}</span>
            <span style={styles.navText}>{option.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    width: "16%",
    minWidth: "250px",
    backgroundColor: "#120022", // Deep purple (darker)
    color: "#E2E2E2",
    padding: "20px",
    borderRight: "1px solid rgba(179, 136, 255, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  loadingContainer: {
    width: "16%",
    backgroundColor: "#120022",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: "16px"
  },
  profileImage: {
    width: "100px",
    height: "100px",
    minWidth: "100px", 
    minHeight: "100px",
    aspectRatio: "1/1",
    borderRadius: "50%",
    overflow: "hidden",
    marginBottom: "10px",
    backgroundColor: "rgba(138, 43, 226, 0.1)",
    border: "2px solid #8A2BE2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  noImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(70, 0, 110, 0.3)",
  },
  noImageText: {
    color: "#B0B3B8",
    fontSize: "12px",
    textAlign: "center"
  },
  userDetails: {
    textAlign: "center",
    width: "100%",
    marginBottom: "15px"
  },
  username: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: "8px",
    wordBreak: "break-word"
  },
  userInfo: {
    fontSize: "16px",
    color: "#B0B3B8",
    marginBottom: "4px",
    wordBreak: "break-word"
  },
  adminBadge: {
    fontSize: "14px",
    color: "#FFFFFF",
    backgroundColor: "rgba(138, 43, 226, 0.3)",
    padding: "4px 8px",
    borderRadius: "12px",
    marginTop: "8px",
    fontWeight: "bold",
    display: "inline-block",
    border: "1px solid #8A2BE2",
    boxShadow: "0 0 8px rgba(138, 43, 226, 0.3)"
  },
  divider: {
    width: "100%",
    marginBottom: "10px",
    borderColor: "rgba(179, 136, 255, 0.2)",
    borderWidth: "1px",
    borderStyle: "solid"
  },
  navList: {
    listStyle: "none",
    padding: 0,
    width: "100%",
    textAlign: "left",
    margin: 0
  },
  navItem: {
    padding: "12px 18px",
    margin: "8px 0",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "rgba(138, 43, 226, 0.1)",
    color: "#FFFFFF",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    transform: "translateX(0)",
    boxShadow: "none"
  },
  navItemHover: {
    background: "linear-gradient(90deg, rgba(138, 43, 226, 0.3) 0%, rgba(179, 136, 255, 0.2) 100%)",
    transform: "translateX(5px)",
    boxShadow: "0 5px 15px rgba(138, 43, 226, 0.2)"
  },
  navIcon: {
    fontSize: "20px",
    flexShrink: 0,
    color: "#B388FF",
    transition: "transform 0.3s ease",
  },
  navText: {
    flex: 1,
    fontWeight: "500"
  }
};