export default function Input({ type = "text", placeholder, value, onChange }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "100%"
        }}
      />
    );
  }
  