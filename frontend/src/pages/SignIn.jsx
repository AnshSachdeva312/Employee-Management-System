import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.warn("Please fill in all fields!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      toast.success("Login Successful!");
      navigate("/position");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url("http://getwallpapers.com/wallpaper/full/5/0/3/718692-amazing-dark-purple-backgrounds-1920x1200.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      animation: 'moveBackground 20s infinite alternate ease-in-out'
    }}>
       <style>
        {`
          @keyframes moveBackground {
            0% {
              background-position: 0% 50%;
            }
            100% {
              background-position: 100% 50%;
            }
          }
        `}
      </style>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      
      <div style={{ 
        width: '400px',
        padding: '40px',
        backgroundColor: 'rgba(30, 15, 50, 0.85)', // Semi-transparent dark purple
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: 'white'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '10px',
            letterSpacing: '0.5px'
          }}>
            Welcome Back
          </h2>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '15px'
          }}>
            Sign in to your account
          </p>
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px'
          }}>
            Email Address
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 15px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '15px',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
              color: 'white'
            }} 
            placeholder="your@email.com"
            onFocus={(e) => {
              e.target.style.borderColor = '#a78bfa';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: '25px', position: 'relative' }}>
          <label style={{ 
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '8px'
          }}>
            Password
          </label>
          <input 
            type={showPassword ? "text" : "password"} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: '100%',
              padding: '12px 15px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '15px',
              paddingRight: '45px',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
              color: 'white'
            }}
            placeholder="Enter your password"
            onFocus={(e) => {
              e.target.style.borderColor = '#a78bfa';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />
          <button 
            type="button" 
            style={{ 
              position: 'absolute',
              right: '15px',
              top: '31.5px',
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '5px',
              transition: 'color 0.2s'
            }}
            onClick={() => setShowPassword(!showPassword)}
            onMouseOver={(e) => e.target.style.color = 'white'}
            onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          style={{ 
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            border: 'none',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px',
            letterSpacing: '0.5px'
          }}
          onMouseOver={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #9f7aea 0%, #8b5cf6 100%)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          Sign In
        </button>

        {/* Footer */}
        <p style={{ 
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '14px'
        }}>
          Don't have an account?{' '}
          <span 
            style={{
              color: '#a78bfa',
              fontWeight: '500',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#8b5cf6';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#a78bfa';
              e.target.style.textDecoration = 'none';
            }}
          >
            Contact Admin
          </span>
        </p>
      </div>
    </div>
  );
}