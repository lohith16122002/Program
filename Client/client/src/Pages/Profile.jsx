import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "../Layouts/DashboardLayout";
import Button from "../Components/Button";
import { useAuth } from "../Context/AuthContext";
import api from "../api/axios";

function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phoneNumber: "",
    github: "",
    linkedin: "",
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        github: user.github || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put("/user/profile", profile);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/user/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed!");
      setShowPwForm(false);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Password change failed");
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
            {initials}
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full border rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            { label: "Full Name", name: "name" },
            { label: "Phone Number", name: "phoneNumber" },
            { label: "GitHub", name: "github" },
            { label: "LinkedIn", name: "linkedin" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block mb-2 font-medium">{label}</label>
              <input
                type="text"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                name={name}
                value={profile[name]}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button onClick={handleUpdate} loading={loading}>Update Profile</Button>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowPwForm(!showPwForm)}
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            {showPwForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPwForm && (
          <form onSubmit={handleChangePassword} className="mt-6 border-t pt-6 space-y-4">
            <h2 className="text-xl font-bold mb-2">Change Password</h2>
            {[
              { label: "Current Password", name: "currentPassword" },
              { label: "New Password", name: "newPassword" },
              { label: "Confirm New Password", name: "confirmPassword" },
            ].map(({ label, name }) => (
              <div key={name}>
                <label className="block mb-2 font-medium">{label}</label>
                <input
                  type="password"
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name={name}
                  value={pwForm[name]}
                  onChange={handlePwChange}
                  required
                />
              </div>
            ))}
            <Button type="submit" loading={pwLoading}>Save Password</Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Profile;
