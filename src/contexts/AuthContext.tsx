import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verify: (data: VerifyData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface LoginData {
  email: string;
  password: string;
}
interface VerifyData {
  otp: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Mock user and profile data only for testing
const MOCK_USER: User = {
  id: "mock-user-id-123",
  email: "demo@example.com",
};

const MOCK_PROFILE: Profile = {
  id: "mock-user-id-123",
  username: "Demo User",
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Import URL in Environment Variable for backend data transfer/receive
  const url = import.meta.env.VITE_URL;
  useEffect(() => {
    // Fetch data using JWT
    const storedUser = localStorage.getItem("mockToken");
    if (storedUser) {
      fetch(url + "/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jwtToken: storedUser }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error != undefined && data.error != "") {
            toast.error(data.error);
            return;
          } else {
            // Set base user data to local storage and state for different purposes
            setUser({ id: data.data._id, email: data.data.email });
            setProfile({ id: data.data._id, username: data.data.username });
            localStorage.setItem(
              "mockUser",
              JSON.stringify({ id: data.data._id, email: data.data.email })
            );
            navigate("/dashboard");
            toast.success("Welcome back!");
          }
        });
    }
    setLoading(false);
  }, []);

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      // Fetch to register user to backend later will be verified using an OTP
      await fetch(url + "/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error != undefined && data.error != "") {
            toast.error(data.error);
            return;
          } else {
            navigate("/verify");
            toast.success(data.message);
          }
        });
    } catch (error: any) {
      console.error("Error registering:", error);
      toast.error("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (data: VerifyData) => {
    try {
      setLoading(true);
      // Fetch to send OTP to backend for verification
      await fetch(url + "/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.error != undefined && data.error != "") {
            toast.error(data.error);
            return;
          } else {
            toast.success(data.message);

            // Code to auto login after verification
            localStorage.setItem("mockToken", JSON.stringify(data.data));
            // Fetch token from local storage
            const storedUser = localStorage.getItem("mockToken");
            if (storedUser == null || storedUser == undefined)
              throw new Error("Error with token");

            if (storedUser) {
              fetch(url + "/api/auth/authenticate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jwtToken: storedUser }),
              })
                .then((response) => response.json())
                .then((data) => {
                  if (data.error != undefined && data.error != "") {
                    toast.error(data.error);
                    return;
                  } else {
                    // Set base user data to local storage and state for different purposes
                    setUser({ id: data.data._id, email: data.data.email });
                    setProfile({
                      id: data.data._id,
                      username: data.data.username,
                    });
                    localStorage.setItem(
                      "mockUser",
                      JSON.stringify({
                        id: data.data._id,
                        email: data.data.email,
                      })
                    );
                    navigate("/dashboard");
                    toast.success("Welcome back!");
                  }
                })
                .catch((err) => {
                  toast.error("Failed to redirect. Try Loging in manually");
                });
            }
          }
        });
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error("Failed to verify. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      // Fecth to login user and get a JWT token
      const loginResponse = await fetch(url + "/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const loginData = await loginResponse.json();

      if (loginData.error != undefined && loginData.error != "") {
        toast.error(loginData.error);
        return;
      } else {
        // Store token to local storage. can also be stored as a cookie
        localStorage.setItem("mockToken", JSON.stringify(loginData.authToken));
        toast.success(loginData.message);
      }

      // Fetch token from local storage
      const storedUser = localStorage.getItem("mockToken");
      if (storedUser == null || storedUser == undefined)
        throw new Error("Error with token");

      if (storedUser) {
        fetch(url + "/api/auth/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jwtToken: storedUser }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error != undefined && data.error != "") {
              toast.error(data.error);
              return;
            } else {
              // Set base user data to local storage and state for different purposes
              setUser({ id: data.data._id, email: data.data.email });
              setProfile({ id: data.data._id, username: data.data.username });
              localStorage.setItem(
                "mockUser",
                JSON.stringify({ id: data.data._id, email: data.data.email })
              );
              navigate("/dashboard");
              toast.success("Welcome back!");
            }
          });
      }
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error("Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setUser(null);
      setProfile(null);
      localStorage.removeItem("mockUser");
      localStorage.removeItem("mockToken");
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, login, register, verify, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
