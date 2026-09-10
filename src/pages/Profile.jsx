import { useEffect, useState } from "react";
import { Save, UserCircle, GraduationCap, Code2, FileText, Mail } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const Profile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    cgpa: "",
    skills: "",
    resumeLink: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const response = await api.get("/student/profile");
      const user = response.data.user;

      setForm({
        name: user.name || "",
        email: user.email || "",
        cgpa: user.cgpa || "",
        skills: user.skills?.join(", ") || "",
        resumeLink: user.resumeLink || "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const skillsArray = form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const response = await api.put("/student/profile", {
        name: form.name,
        cgpa: Number(form.cgpa),
        skills: skillsArray,
        resumeLink: form.resumeLink,
      });

      setForm({
        ...form,
        name: response.data.user.name,
        cgpa: response.data.user.cgpa,
        skills: response.data.user.skills.join(", "),
        resumeLink: response.data.user.resumeLink,
      });

      const storedUser = JSON.parse(
        localStorage.getItem("user")
      );

      if (storedUser) {
        storedUser.name = response.data.user.name;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          Loading profile...
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 premium-page profile-page">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <p className="text-indigo-600 font-semibold text-sm">
            STUDENT PROFILE
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Manage Your Profile
          </h1>

          <p className="text-slate-500 mt-2">
            Keep your academic information and skills updated for
            accurate job eligibility.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <UserCircle size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Personal Information
                </h2>

                <p className="text-sm text-slate-500">
                  Basic account information
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                  />
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Email cannot be changed.
                </p>
              </div>

            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <GraduationCap size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Academic Information
                </h2>

                <p className="text-sm text-slate-500">
                  Used for placement eligibility
                </p>
              </div>
            </div>

            <div className="max-w-sm">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Current CGPA
              </label>

              <input
                type="number"
                name="cgpa"
                value={form.cgpa}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Code2 size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Technical Skills
                </h2>

                <p className="text-sm text-slate-500">
                  Add skills separated by commas
                </p>
              </div>
            </div>

            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="JavaScript, React.js, Node.js, MongoDB, SQL"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <p className="text-xs text-slate-400 mt-2">
              Example: JavaScript, Python, SQL, React.js
            </p>
          </div>

          {/* Resume */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <FileText size={23} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Resume
                </h2>

                <p className="text-sm text-slate-500">
                  Add a link to your resume
                </p>
              </div>
            </div>

            <input
              type="url"
              name="resumeLink"
              value={form.resumeLink}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <Save size={19} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default Profile;
