import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthLayout from "../Components/AuthLayout";
import Input from "../Components/Input";
import Button from "../Components/Button";
import { useAuth } from "../Context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Start analyzing your resume">
      <form onSubmit={handleSubmit}>
        <Input label="Full Name" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} />
        <Input label="Email" name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} />
        <Input label="Password" name="password" type="password" placeholder="Create password" value={form.password} onChange={handleChange} />
        <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} />
        <Button type="submit" loading={loading}>Register</Button>
      </form>
      <p className="text-center mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
