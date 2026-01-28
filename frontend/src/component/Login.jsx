import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Lock, Eye, EyeOff } from "lucide-react";

import Button from "./Button";
import { loginAdmin } from "../api/Login";
import TextInput from "./Input";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return toast.error("Fix form errors");

    try {
      setLoading(true);

      const data = await loginAdmin(email, password);

      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("isAdminLoggedIn", "true");

      toast.success("Login successful");
      navigate("/admin");
    } catch (err) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center overflow-y-auto">
      <div className="w-full max-w-md flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-5 sm:p-8">
          <h2 className="text-center text-lg sm:text-2xl font-bold text-gray-800">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 sm:space-y-5">
            <TextInput
              name="email"
              placeholder="Email"
              type="email"
              icon={<User size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <TextInput
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              showToggle
              onToggle={() => setShowPassword((s) => !s)}
              toggleIconOn={<EyeOff size={18} />}
              toggleIconOff={<Eye size={18} />}
            />

            <div className="pt-1">
              <Button type="submit" full disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}