import { useEffect, useState } from "react";
import axios from "axios";
import EmpPanel from "../../components/EmpPanel";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { FaBriefcase, FaBuilding, FaCalendarAlt, FaUserCheck, FaMoneyBillWave, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";

export default function EmpPosition() {
  const [position, setPosition] = useState(null);
  const [salary, setSalary] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized: No token found");
          return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        const [positionRes, salaryRes] = await Promise.all([
          axios.get("http://localhost:3000/api/user/position", {
            headers: { authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/user/salary", {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        setPosition(positionRes.data.position);
        setSalary(salaryRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <EmpPanel 
        user={{ 
          username: user?.name || "Unknown User", 
          email: user?.email || "No Email Available",
          phone: user?.phone || "No Phone Available" 
        }} 
      />
      
      <div style={styles.content}>
        {/* Position Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.section}
        >
          <div style={styles.sectionHeader}>
            <FaBriefcase style={styles.sectionIcon} />
            <h2 style={styles.sectionTitle}>Your Position</h2>
          </div>
          
          <div style={styles.positionGrid}>
            {position && [
              { icon: <FaBriefcase />, label: "Designation", value: position.designation },
              { icon: <FaBuilding />, label: "Department", value: position.department },
              { icon: <FaCalendarAlt />, label: "Join Date", value: new Date(position.dateOfJoining).toLocaleDateString() },
              { icon: <FaUserCheck />, label: "Status", value: position.status },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(123, 31, 162, 0.3)" }}
                style={styles.positionCard}
              >
                <div style={styles.positionIcon}>{item.icon}</div>
                <div>
                  <p style={styles.positionLabel}>{item.label}</p>
                  <p style={styles.positionValue}>{item.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Salary Section */}
        {salary && (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={styles.section}
            >
              <div style={styles.sectionHeader}>
                <FaMoneyBillWave style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Salary Breakdown</h2>
              </div>
              
              <div style={styles.salaryGrid}>
                {[
                  { label: "Base Salary", value: salary.baseSalary, color: "#9c27b0" },
                  { label: "Net Salary", value: salary.netSalary, color: "#00bcd4" },
                  { label: "HRA", value: salary.allowances.houseRentAllowance, color: "#673ab7" },
                  { label: "Transport", value: salary.allowances.transportAllowance, color: "#ff9800" },
                  { label: "Medical", value: salary.allowances.medicalAllowance, color: "#e91e63" },
                  { label: "Income Tax", value: salary.taxes.incomeTax, color: "#607d8b" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 25px rgba(123, 31, 162, 0.3)" }}
                    style={{ ...styles.salaryCard, borderLeft: `4px solid ${item.color}` }}
                  >
                    <p style={styles.salaryLabel}>{item.label}</p>
                    <p style={styles.salaryValue}>
                      {salary.currency} {item.value.toLocaleString()}
                    </p>
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '3px', 
                      background: `linear-gradient(90deg, ${item.color}, transparent)`,
                      opacity: 0.7
                    }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Salary Chart Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={styles.section}
            >
              <div style={styles.sectionHeader}>
                <FaChartLine style={styles.sectionIcon} />
                <h2 style={styles.sectionTitle}>Salary & Bonus Trends</h2>
              </div>
              
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salary.salaryHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
                    <XAxis 
                      dataKey="year" 
                      tick={{ fill: '#bdbdbd' }} 
                      axisLine={{ stroke: '#444' }}
                    />
                    <YAxis 
                      tick={{ fill: '#bdbdbd' }}
                      axisLine={{ stroke: '#444' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: '#2a2a2a',
                        border: '1px solid #444',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#bdbdbd', paddingTop: '20px' }}
                    />
                    <Bar 
                      dataKey="salary" 
                      name="Salary" 
                      fill="#9c27b0" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="bonusReceived" 
                      name="Bonus" 
                      fill="#00bcd4" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: "flex", 
    minHeight: "100vh",
    backgroundColor: "#0d0d0d"
  },
  content: { 
    flex: 1, 
    padding: "30px",
    position: "relative",
    overflow: "hidden",
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),url("https://static.vecteezy.com/system/resources/previews/005/071/443/original/realistic-dark-purple-background-with-low-poly-shape-and-shadow-abstract-purple-banner-free-vector.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  },
  section: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    borderRadius: "16px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "25px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "15px"
  },
  sectionIcon: {
    fontSize: "24px",
    color: "#bb86fc",
    marginRight: "15px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#f0f0f0",
    margin: 0
  },
  positionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px"
  },
  positionCard: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid rgba(255, 255, 255, 0.04)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  positionIcon: {
    fontSize: "20px",
    color: "#bb86fc",
    backgroundColor: "rgba(187, 134, 252, 0.15)",
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  positionLabel: {
    fontSize: "14px",
    color: "#cccccc",
    margin: 0,
    marginBottom: "5px"
  },
  positionValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  salaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "15px"
  },
  salaryCard: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.35)",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s ease",
  },
  salaryLabel: {
    fontSize: "14px",
    color: "#cccccc",
    margin: 0,
    marginBottom: "10px"
  },
  salaryValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#ffffff",
    margin: 0
  },
  chartContainer: {
    width: "100%",
    height: "400px",
    marginTop: "20px"
  },
  loading: { 
    textAlign: "center", 
    fontSize: "18px", 
    color: "#bb86fc",
    padding: "50px",
    backgroundColor: "#121212"
  },
  error: { 
    textAlign: "center", 
    fontSize: "18px", 
    color: "#cf6679",
    padding: "50px",
    backgroundColor: "#121212"
  }
};