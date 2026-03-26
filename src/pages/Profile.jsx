import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  // Fetch user data from localStorage
  // If no user exists, provide a fallback (so hardcoded dummies don't crash it)
  const defaultUser = {
    name: "Demo User",
    email: "demo@example.com",
    role: localStorage.getItem("role") || "citizen",
  };

  const savedUserString = localStorage.getItem("user");
  const user = savedUserString ? JSON.parse(savedUserString) : defaultUser;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: '"Inter", sans-serif',
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        className="page-header"
        style={{
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h1
          className="page-title"
          style={{ fontSize: "2rem", color: "#0f172a", margin: "0 0 8px 0" }}
        >
          User Profile
        </h1>
        <p className="page-subtitle" style={{ color: "#64748b", margin: 0 }}>
          Manage your personal information
        </p>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "30px",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a" }}>
              {user.name}
            </h2>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                background: "#e0f2fe",
                color: "#0284c7",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "600",
                marginTop: "8px",
                textTransform: "capitalize",
              }}
            >
              {user.role} Account
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div
            style={{
              padding: "15px",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              Email Address
            </p>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "1.05rem",
                color: "#334155",
                fontWeight: "600",
              }}
            >
              {user.email}
            </p>
          </div>

          <div
            style={{
              padding: "15px",
              background: "#f8fafc",
              borderRadius: "12px",
              border: "1px solid #f1f5f9",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "#64748b",
                fontWeight: "500",
              }}
            >
              System Role
            </p>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "1.05rem",
                color: "#334155",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            marginTop: "30px",
            padding: "14px",
            background: "#fee2e2",
            color: "#ef4444",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#fca5a5")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#fee2e2")}
        >
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}

export default Profile;
