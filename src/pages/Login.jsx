import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

function Login() {
  const [emailOrUser, setEmailOrUser] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const selectedRole = location.state?.role || "citizen";

  const handleLogin = async (e) => {
    e.preventDefault();

    // Real Hospital Authentication from Firestore
    if (selectedRole === "hospital") {
      try {
        const q = query(
          collection(db, "hospitals"),
          where("email", "==", emailOrUser),
          where("password", "==", password),
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const hospitalData = querySnapshot.docs[0].data();
          const hospitalId = querySnapshot.docs[0].id;

          localStorage.setItem("role", "hospital");
          localStorage.setItem("isAuth", "true");
          localStorage.setItem("hospitalId", hospitalId);
          localStorage.setItem("hospitalName", hospitalData.name);

          navigate("/hospital");
          return;
        }
      } catch (err) {
        console.error("Error logging in hospital:", err);
      }
    }

    // 1. Check if it matches existing simple dummy credentials
    const isDummyValid =
      (selectedRole === "citizen" &&
        emailOrUser === "citizen" &&
        password === "123") ||
      (selectedRole === "authority" &&
        emailOrUser === "authority" &&
        password === "123");

    // 2. Check if it matches stored registered user
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const isRegisteredValid =
      storedUser &&
      storedUser.email === emailOrUser &&
      storedUser.password === password;

    if (isDummyValid || isRegisteredValid) {
      // Determine role: if registered user, use their stored role, else use selected dummy role
      const finalRole = isRegisteredValid ? storedUser.role : selectedRole;

      localStorage.setItem("role", finalRole);
      localStorage.setItem("isAuth", "true");

      navigate(`/${finalRole}`);
    } else {
      alert(
        "Invalid credentials. Please register or check your login details.",
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      let finalRole = "citizen";

      if (userDoc.exists()) {
        finalRole = userDoc.data().role;
      } else {
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "Google User",
          email: user.email,
          role: "citizen",
        });
      }

      const newUser = {
        name: user.displayName || "Google User",
        email: user.email,
        role: finalRole,
      };
      localStorage.setItem("user", JSON.stringify(newUser));

      localStorage.setItem("role", finalRole);
      localStorage.setItem("isAuth", "true");
      navigate(`/${finalRole}`);
    } catch (error) {
      console.error("Google Login Error:", error.message);
      alert("Failed to login with Google.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)",
        padding: "20px",
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "440px",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <img
              src="/logo-transparent.png"
              alt="Arogya360 Logo"
              style={{
                height: "150px", // adjust size as needed
                objectFit: "contain",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "6px",
            }}
          >
            Smart Health System
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Sign in as{" "}
            <strong style={{ color: "#0d9488" }}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </strong>
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              Email or Username
            </label>
            <input
              type="text"
              placeholder="Enter email or username..."
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#475569",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                fontSize: "0.95rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d9488")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#0d9488",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.2s",
              boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0f766e")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#0d9488")}
          >
            Sign In
          </button>
        </form>

        {selectedRole === "citizen" ? (
          <>
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "20px 0",
                }}
              >
                <div
                  style={{ flex: 1, backgroundColor: "#e2e8f0", height: "1px" }}
                ></div>
                <span
                  style={{
                    padding: "0 16px",
                    color: "#94a3b8",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  OR
                </span>
                <div
                  style={{ flex: 1, backgroundColor: "#e2e8f0", height: "1px" }}
                ></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  width: "100%",
                  padding: "14px",
                  backgroundColor: "white",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "#334155",
                }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  width="20"
                  alt="google"
                />
                Continue with Google
              </button>
            </div>

            <div
              style={{
                marginTop: "24px",
                textAlign: "center",
                fontSize: "0.95rem",
              }}
            >
              <span style={{ color: "#64748b" }}>New User? </span>
              <Link
                to="/register"
                style={{
                  color: "#0d9488",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Register
              </Link>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Link
                to="/"
                style={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                ← Back to Role Selection
              </Link>
            </div>
          </>
        ) : (
          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <Link
              to="/"
              style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "0.95rem",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Back to Role Selection
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
