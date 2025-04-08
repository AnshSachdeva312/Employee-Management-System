export default function Button({ children, onClick, style }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          backgroundColor: "#4F46E5",
          color: "#fff",
          cursor: "pointer",
          fontSize: "14px",
          ...style,
        }}
      >
        {children}
      </button>
    );
  }
  