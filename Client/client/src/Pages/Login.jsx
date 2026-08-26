import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../Components/AuthLayout";
import Input from "../Components/Input";
import Button from "../Components/Button";
import { useAuth } from "../Context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to your account">
      <form onSubmit={handleSubmit}>
        <Input label="Email" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} />
        <Input label="Password" name="password" type="password" placeholder="Enter your password" value={form.password} onChange={handleChange} />
        <Button type="submit" loading={loading}>Login</Button>
      </form>
      <p className="text-center mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
