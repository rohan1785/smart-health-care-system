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
        backgroundColor: "#F5F5F5",
        padding: "20px",
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "4px",
          padding: "40px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #D1D5DB",
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
                height: "120px",
                objectFit: "contain",
              }}
            />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "6px",
            }}
          >
            Smart Health System
          </h1>
          <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>
            Sign in as{" "}
            <strong style={{ color: "#003D82" }}>
              {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </strong>
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
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
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid #D1D5DB",
                backgroundColor: "#FFFFFF",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
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
                padding: "10px 12px",
                borderRadius: "4px",
                border: "1px solid #D1D5DB",
                backgroundColor: "#FFFFFF",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#047857",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "8px"
            }}
          >
            Sign In
          </button>
        </form>

        {selectedRole === "citizen" ? (
          <>
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "16px 0",
                }}
              >
                <div
                  style={{ flex: 1, backgroundColor: "#D1D5DB", height: "1px" }}
                ></div>
                <span
                  style={{
                    padding: "0 12px",
                    color: "#9CA3AF",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                  }}
                >
                  OR
                </span>
                <div
                  style={{ flex: 1, backgroundColor: "#D1D5DB", height: "1px" }}
                ></div>
              </div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "white",
                  border: "1px solid #D1D5DB",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  color: "#374151",
                }}
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  width="18"
                  alt="google"
                />
                Continue with Google
              </button>
            </div>

            <div
              style={{
                marginTop: "20px",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ color: "#6B7280" }}>New User? </span>
              <Link
                to="/register"
                style={{
                  color: "#003D82",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Register
              </Link>
            </div>

            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link
                to="/"
                style={{
                  color: "#9CA3AF",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                ← Back to Role Selection
              </Link>
            </div>
          </>
        ) : (
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link
              to="/"
              style={{
                color: "#6B7280",
                textDecoration: "none",
                fontSize: "0.875rem",
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
