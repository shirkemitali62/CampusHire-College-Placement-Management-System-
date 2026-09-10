import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Target,
  Users,
  Building2,
  Briefcase,
  FileText,
  CheckCircle,
  TrendingUp,
  Plus,
  RefreshCw,
  Pencil,
  Lock,
  Unlock,
  Save,
  X,
  CalendarDays,
  Search,
  MapPin,
  IndianRupee,
  GraduationCap,
  AlertCircle,
  Check,
  ChevronDown,
  BarChart3,
  FilterX,
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";

const emptyJobForm = {
  companyName: "",
  jobTitle: "",
  description: "",
  location: "",
  package: "",
  minimumCGPA: "",
  requiredSkills: "",
  applicationDeadline: "",
};

const validateJobForm = (form) => {
  const packageValue = Number(form.package);
  const cgpaValue = Number(form.minimumCGPA);
  const skills = form.requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  if (packageValue <= 0) return "Package must be greater than 0 LPA.";
  if (cgpaValue < 0 || cgpaValue > 10) return "Minimum CGPA must be between 0 and 10.";
  if (skills.length === 0) return "Add at least one required skill.";
  if (!form.applicationDeadline) return "Please select an application deadline.";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${form.applicationDeadline}T00:00:00`);
  if (Number.isNaN(deadline.getTime()) || deadline < today) {
    return "Application deadline cannot be in the past.";
  }

  return "";
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [closingJob, setClosingJob] = useState("");
  const [reopeningJob, setReopeningJob] = useState("");
  const [editingJob, setEditingJob] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [editForm, setEditForm] = useState(emptyJobForm);

  // Search / filters
  const [jobSearch, setJobSearch] = useState("");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  const [studentSearch, setStudentSearch] = useState("");
  const [studentCgpaFilter, setStudentCgpaFilter] = useState("all");

  const [applicationSearch, setApplicationSearch] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] =
    useState("all");

  // Confirmation modal
  const [confirmModal, setConfirmModal] = useState(null);

  // -----------------------------
  // Notifications
  // -----------------------------

  const showMessage = (text) => {
    setError("");
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3500);
  };

  const showError = (text) => {
    setMessage("");
    setError(text);

    window.setTimeout(() => {
      setError("");
    }, 4500);
  };

  // -----------------------------
  // Fetch Dashboard
  // -----------------------------

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        statsRes,
        studentsRes,
        applicationsRes,
        jobsRes,
      ] = await Promise.all([
        api.get("/dashboard"),
        api.get("/admin/students"),
        api.get("/admin/applications"),
        api.get("/company/all"),
      ]);

      setStats(statsRes.data.stats || {});
      setStudents(studentsRes.data.students || []);
      setApplications(
        applicationsRes.data.applications || []
      );
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchDashboard is stable for the component's lifetime
  }, []);

  // -----------------------------
  // Add Job
  // -----------------------------

  const handleJobChange = (e) => {
    setJobForm({
      ...jobForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();

    const validationError = validateJobForm(jobForm);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/company", {
        companyName: jobForm.companyName,
        jobTitle: jobForm.jobTitle,
        description: jobForm.description,
        location: jobForm.location,
        package: Number(jobForm.package),
        minimumCGPA: Number(jobForm.minimumCGPA),
        requiredSkills: jobForm.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        applicationDeadline:
          jobForm.applicationDeadline,
        status: "open",
      });

      setJobForm(emptyJobForm);
      showMessage("Job opportunity added successfully.");
      await fetchDashboard(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to add job."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Edit Job
  // -----------------------------

  const startEditing = (job) => {
    setError("");
    setMessage("");

    setEditingJob(job._id);

    setEditForm({
      companyName: job.companyName || "",
      jobTitle: job.jobTitle || "",
      description: job.description || "",
      location: job.location || "",
      package: job.package ?? "",
      minimumCGPA: job.minimumCGPA ?? "",
      requiredSkills:
        job.requiredSkills?.join(", ") || "",
      applicationDeadline: job.applicationDeadline
        ? new Date(job.applicationDeadline)
            .toISOString()
            .split("T")[0]
        : "",
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const cancelEditing = () => {
    setEditingJob("");
    setEditForm(emptyJobForm);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();

    if (!editingJob) return;

    const validationError = validateJobForm(editForm);
    if (validationError) {
      showError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.put(`/company/${editingJob}`, {
        companyName: editForm.companyName,
        jobTitle: editForm.jobTitle,
        description: editForm.description,
        location: editForm.location,
        package: Number(editForm.package),
        minimumCGPA: Number(editForm.minimumCGPA),
        requiredSkills: editForm.requiredSkills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        applicationDeadline:
          editForm.applicationDeadline,
      });

      cancelEditing();
      showMessage("Job updated successfully.");
      await fetchDashboard(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to update job."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Close / Reopen Job
  // -----------------------------

  const handleCloseJob = async (jobId) => {
    try {
      setClosingJob(jobId);
      setConfirmModal(null);

      await api.put(`/company/${jobId}/close`);

      showMessage("Job closed successfully.");
      await fetchDashboard(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to close job."
      );
    } finally {
      setClosingJob("");
    }
  };

  const handleReopenJob = async (jobId) => {
    try {
      setReopeningJob(jobId);
      setConfirmModal(null);

      await api.put(`/company/${jobId}/reopen`);

      showMessage("Job reopened successfully.");
      await fetchDashboard(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to reopen job."
      );
    } finally {
      setReopeningJob("");
    }
  };

  // -----------------------------
  // Application Status
  // -----------------------------

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      setConfirmModal(null);

      await api.put(
        `/admin/applications/${applicationId}`,
        {
          status,
        }
      );

      showMessage(
        `Application marked as ${status}.`
      );

      await fetchDashboard(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Failed to update application status."
      );
    }
  };

  // -----------------------------
  // Confirmation
  // -----------------------------

  const askConfirmation = ({
    title,
    message,
    confirmText,
    danger = false,
    action,
  }) => {
    setConfirmModal({
      title,
      message,
      confirmText,
      danger,
      action,
    });
  };

  // -----------------------------
  // Derived Statistics
  // -----------------------------

  const selectedCount = applications.filter(
    (app) => app.status === "selected"
  ).length;

  const shortlistedCount = applications.filter(
    (app) => app.status === "shortlisted"
  ).length;

  // Applied = total applications submitted. A shortlisted/selected/rejected
  // application has already passed through the applied stage.
  const appliedCount = applications.length;

  const rejectedCount = applications.filter(
    (app) => app.status === "rejected"
  ).length;

  const openJobs = jobs.filter(
    (job) => job.status === "open"
  ).length;

  const closedJobs = jobs.filter(
    (job) => job.status !== "open"
  ).length;

  const calculatedPlacementRate =
    students.length > 0
      ? Math.round(
          (selectedCount / students.length) * 100
        )
      : 0;

  const placementRate =
    stats.placementPercentage ??
    calculatedPlacementRate;

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents ?? students.length,
      icon: Users,
      iconBg: "bg-indigo-50",
      iconText: "text-indigo-600",
      accent: "border-indigo-100",
    },
    {
      label: "Companies",
      value: stats.totalCompanies ?? 0,
      icon: Building2,
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      accent: "border-blue-100",
    },
    {
      label: "Active Jobs",
      value: stats.activeJobs ?? openJobs,
      icon: Briefcase,
      iconBg: "bg-emerald-50",
      iconText: "text-emerald-600",
      accent: "border-emerald-100",
    },
    {
      label: "Applications",
      value:
        stats.totalApplications ??
        applications.length,
      icon: FileText,
      iconBg: "bg-purple-50",
      iconText: "text-purple-600",
      accent: "border-purple-100",
    },
    {
      label: "Selected",
      value:
        stats.selectedStudents ?? selectedCount,
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconText: "text-green-600",
      accent: "border-green-100",
    },
    {
      label: "Placement Rate",
      value: `${placementRate}%`,
      icon: TrendingUp,
      iconBg: "bg-orange-50",
      iconText: "text-orange-600",
      accent: "border-orange-100",
    },
  ];

  // -----------------------------
  // Search Filters
  // -----------------------------

  const filteredJobs = useMemo(() => {
    const search = jobSearch.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.companyName
          ?.toLowerCase()
          .includes(search) ||
        job.jobTitle
          ?.toLowerCase()
          .includes(search) ||
        job.location
          ?.toLowerCase()
          .includes(search) ||
        job.requiredSkills?.some((skill) =>
          skill.toLowerCase().includes(search)
        );

      const matchesStatus =
        jobStatusFilter === "all" ||
        job.status === jobStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, jobSearch, jobStatusFilter]);

  const filteredStudents = useMemo(() => {
    const search = studentSearch.toLowerCase().trim();

    return students.filter((student) => {
      const cgpa = Number(student.cgpa || 0);

      const matchesSearch =
        !search ||
        student.name
          ?.toLowerCase()
          .includes(search) ||
        student.email
          ?.toLowerCase()
          .includes(search) ||
        student.skills?.some((skill) =>
          skill.toLowerCase().includes(search)
        );

      let matchesCgpa = true;

      if (studentCgpaFilter === "9+") {
        matchesCgpa = cgpa >= 9;
      } else if (studentCgpaFilter === "8-8.99") {
        matchesCgpa = cgpa >= 8 && cgpa < 9;
      } else if (studentCgpaFilter === "7-7.99") {
        matchesCgpa = cgpa >= 7 && cgpa < 8;
      } else if (studentCgpaFilter === "below7") {
        matchesCgpa = cgpa < 7;
      }

      return matchesSearch && matchesCgpa;
    });
  }, [
    students,
    studentSearch,
    studentCgpaFilter,
  ]);

  const filteredApplications = useMemo(() => {
    const search =
      applicationSearch.toLowerCase().trim();

    return applications.filter((application) => {
      const studentName =
        application.student?.name || "";

      const studentEmail =
        application.student?.email || "";

      const companyName =
        application.company?.companyName || "";

      const jobTitle =
        application.company?.jobTitle || "";

      const matchesSearch =
        !search ||
        studentName.toLowerCase().includes(search) ||
        studentEmail.toLowerCase().includes(search) ||
        companyName.toLowerCase().includes(search) ||
        jobTitle.toLowerCase().includes(search);

      const matchesStatus =
        applicationStatusFilter === "all" ||
        application.status ===
          applicationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    applications,
    applicationSearch,
    applicationStatusFilter,
  ]);
const analytics = useMemo(() => {
  const statusCounts = {
    applied: 0,
    shortlisted: 0,
    selected: 0,
    rejected: 0,
  };

  applications.forEach((app) => {
    const status = String(app.status || "applied").toLowerCase();

    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
  });

  const companyCounts = {};

  applications.forEach((app) => {
    const companyName =
      app.company?.companyName ||
      app.company?.name ||
      app.companyName ||
      "Unknown Company";

    companyCounts[companyName] =
      (companyCounts[companyName] || 0) + 1;
  });

  const companyApplications = Object.entries(companyCounts)
    .map(([company, count]) => ({
      company,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    statusCounts,
    companyApplications,
    openJobs: jobs.filter(
      (job) => String(job.status).toLowerCase() === "open"
    ).length,
    closedJobs: jobs.filter(
      (job) => String(job.status).toLowerCase() !== "open"
    ).length,
  };
}, [applications, jobs]);
  // -----------------------------
  // Helpers
  // -----------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDeadlineState = (date) => {
    if (!date) return "normal";

    const deadline = new Date(date);
    const today = new Date();

    deadline.setHours(23, 59, 59, 999);

    if (deadline < today) return "expired";

    const diff =
      deadline.getTime() - today.getTime();

    const days = Math.ceil(
      diff / (1000 * 60 * 60 * 24)
    );

    if (days <= 3) return "urgent";

    return "normal";
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "selected":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "shortlisted":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getReadiness = (cgpa) => {
    const value = Number(cgpa || 0);

    if (value >= 9) {
      return {
        text: "Excellent",
        classes:
          "bg-emerald-50 text-emerald-700",
      };
    }

    if (value >= 8) {
      return {
        text: "Strong",
        classes:
          "bg-blue-50 text-blue-700",
      };
    }

    if (value >= 7) {
      return {
        text: "Good",
        classes:
          "bg-amber-50 text-amber-700",
      };
    }

    return {
      text: "Needs Improvement",
      classes:
        "bg-red-50 text-red-700",
    };
  };

  const resetFilters = () => {
    setJobSearch("");
    setJobStatusFilter("all");
    setStudentSearch("");
    setStudentCgpaFilter("all");
    setApplicationSearch("");
    setApplicationStatusFilter("all");
  };

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw
                size={25}
                className="animate-spin"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Loading dashboard
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Fetching students, jobs and applications...
            </p>

            <div className="mt-6 space-y-3">
              <div className="h-3 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-4/5 mx-auto" />
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/5 mx-auto" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 premium-page admin-dashboard">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wide">
              <BarChart3 size={14} />
              ADMIN PORTAL
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
              Placement Dashboard
            </h1>

            <p className="text-slate-500 mt-2 max-w-2xl">
              Manage students, companies, job opportunities
              and placement applications from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="self-start lg:self-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60 font-semibold text-sm shadow-sm"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />
            {refreshing
              ? "Refreshing..."
              : "Refresh Data"}
          </button>
        </div>

        {/* =========================================
            ALERTS
        ========================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />
            <div className="text-sm font-medium">
              {error}
            </div>

            <button
              onClick={() => setError("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            <Check
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="text-sm font-medium">
              {message}
            </div>

            <button
              onClick={() => setMessage("")}
              className="ml-auto"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* =========================================
            STATISTICS
        ========================================= */}

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`bg-white border ${card.accent} rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.iconBg} ${card.iconText} flex items-center justify-center`}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 mt-4">
                  {card.label}
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {card.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* =========================================
            PLACEMENT PERFORMANCE
        ========================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  Placement Performance
                </h2>
              </div>

              <p className="text-sm text-slate-500 mt-2">
                Overall student placement progress
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">

                <svg
                  viewBox="0 0 120 120"
                  className="w-full h-full -rotate-90"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    className="text-indigo-600"
                    strokeDasharray={`${
                      2 * Math.PI * 48
                    }`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      48 *
                      (1 -
                        Math.min(
                          Number(placementRate),
                          100
                        ) /
                          100)
                    }`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">
                    {placementRate}%
                  </span>

                  <span className="text-[10px] text-slate-500">
                    Placement
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Applied
              </p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {appliedCount}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs text-blue-600">
                Shortlisted
              </p>
              <p className="text-xl font-bold text-blue-700 mt-1">
                {shortlistedCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-600">
                Selected
              </p>
              <p className="text-xl font-bold text-emerald-700 mt-1">
                {selectedCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-xs text-red-600">
                Rejected
              </p>
              <p className="text-xl font-bold text-red-700 mt-1">
                {rejectedCount}
              </p>
            </div>

          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Placement progress</span>
              <span>{placementRate}%</span>
            </div>

            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Number(placementRate),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </section>
{/* =========================
    ADMIN ANALYTICS
========================= */}

<section className="mt-8 space-y-6">

  {/* Analytics Header */}
  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-slate-900">
          Placement Analytics
        </h2>
      </div>

      <p className="mt-1 text-sm text-slate-500">
        Detailed insights into applications, jobs and placement progress.
      </p>
    </div>

    <div className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
      Live Dashboard
    </div>
  </div>


  {/* =========================
      ANALYTICS TOP CARDS
  ========================= */}

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Total Applications
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {applications.length}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 p-3">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Applications received
      </p>
    </div>


    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Shortlisted
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {analytics.statusCounts.shortlisted}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 p-3">
          <Target className="h-6 w-6 text-amber-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Candidates shortlisted
      </p>
    </div>


    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Selected
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {analytics.statusCounts.selected}
          </p>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3">
          <CheckCircle className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Successfully placed
      </p>
    </div>


    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Available Jobs
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {analytics.openJobs}
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 p-3">
          <Briefcase className="h-6 w-6 text-indigo-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Currently accepting applications
      </p>
    </div>

  </div>


  {/* =========================
      CHART ROW
  ========================= */}

  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">


    {/* APPLICATION STATUS */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            Application Status
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Current application distribution
          </p>
        </div>

        <PieChart className="h-5 w-5 text-slate-400" />
      </div>


      <div className="space-y-5">

        {[
          {
            label: "Applied",
            value: analytics.statusCounts.applied,
            className: "bg-blue-500",
          },
          {
            label: "Shortlisted",
            value: analytics.statusCounts.shortlisted,
            className: "bg-amber-500",
          },
          {
            label: "Selected",
            value: analytics.statusCounts.selected,
            className: "bg-emerald-500",
          },
          {
            label: "Rejected",
            value: analytics.statusCounts.rejected,
            className: "bg-red-500",
          },
        ].map((item) => {

          const percentage =
            applications.length > 0
              ? Math.round((item.value / applications.length) * 100)
              : 0;

          return (
            <div key={item.label}>

              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                  />

                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>

                <span className="font-semibold text-slate-900">
                  {item.value}
                </span>
              </div>


              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.className}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />

              </div>

              <p className="mt-1 text-right text-xs text-slate-400">
                {percentage}%
              </p>

            </div>
          );
        })}

      </div>
    </div>


    {/* JOB STATUS */}
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">
            Job Opportunities
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Open and closed placement opportunities
          </p>
        </div>

        <Briefcase className="h-5 w-5 text-slate-400" />
      </div>


      <div className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:justify-center">

        {/* PROPER DONUT CHART: single ring, two segments, dynamic center total */}
        <div className="relative h-40 w-40 shrink-0">

          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
          >
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-slate-100"
            />

            {/* Closed segment (drawn first, sits under open) */}
            {jobs.length > 0 && analytics.closedJobs > 0 && (
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                className="text-slate-300"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${
                  2 *
                  Math.PI *
                  48 *
                  (1 - analytics.closedJobs / jobs.length)
                }`}
              />
            )}

            {/* Open segment */}
            {jobs.length > 0 && analytics.openJobs > 0 && (
              <circle
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                className="text-emerald-500"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${
                  2 *
                  Math.PI *
                  48 *
                  (1 - analytics.openJobs / jobs.length)
                }`}
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-900">
              {jobs.length}
            </span>
            <span className="text-xs text-slate-500">
              Total Jobs
            </span>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex gap-6 sm:flex-col sm:gap-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none">
                {analytics.openJobs}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Open Jobs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-3 w-3 shrink-0 rounded-full bg-slate-300" />
            <div>
              <p className="text-xl font-bold text-slate-900 leading-none">
                {analytics.closedJobs}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Closed Jobs
              </p>
            </div>
          </div>
        </div>

      </div>


      <div className="mt-4 rounded-xl bg-slate-50 p-4">

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Total Opportunities
          </span>

          <span className="font-bold text-slate-900">
            {jobs.length}
          </span>
        </div>

      </div>

    </div>

  </div>


  {/* =========================
      COMPANY-WISE APPLICATIONS
  ========================= */}

  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

    <div className="mb-6 flex items-center justify-between">

      <div>
        <h3 className="font-bold text-slate-900">
          Company-wise Applications
        </h3>

        <p className="mt-1 text-xs text-slate-500">
          Applications received by each company
        </p>
      </div>

      <Building2 className="h-5 w-5 text-slate-400" />

    </div>


    {analytics.companyApplications.length === 0 ? (

      <div className="rounded-xl bg-slate-50 py-10 text-center">
        <Building2 className="mx-auto h-8 w-8 text-slate-300" />

        <p className="mt-3 text-sm font-medium text-slate-600">
          No application data available
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Company analytics will appear here once students apply.
        </p>
      </div>

    ) : (

      <div className="space-y-5">

        {analytics.companyApplications.map((item) => {

          const maxApplications =
            analytics.companyApplications[0]?.count || 1;

          const width =
            Math.max(
              8,
              Math.round((item.count / maxApplications) * 100)
            );

          return (
            <div key={item.company}>

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                  </div>

                  <span className="text-sm font-semibold text-slate-800">
                    {item.company}
                  </span>

                </div>

                <span className="text-sm font-bold text-slate-900">
                  {item.count}
                </span>

              </div>


              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                  style={{
                    width: `${width}%`,
                  }}
                />

              </div>

            </div>
          );
        })}

      </div>

    )}

  </div>


  {/* =========================
      PLACEMENT FUNNEL
  ========================= */}

  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

    <div className="mb-6">

      <h3 className="font-bold text-slate-900">
        Placement Funnel
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Track students from registration to final selection
      </p>

    </div>


    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

      {[
        {
          label: "Registered",
          value: students.length,
          icon: Users,
        },
        {
          label: "Applied",
          value: applications.length,
          icon: FileText,
        },
        {
          label: "Shortlisted",
          value: analytics.statusCounts.shortlisted,
          icon: Target,
        },
        {
          label: "Selected",
          value: analytics.statusCounts.selected,
          icon: CheckCircle,
        },
      ].map((item, index) => {

        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="relative rounded-2xl bg-slate-50 p-5"
          >

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-white p-3 shadow-sm">
                <Icon className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  {item.label}
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>

            </div>

            {index < 3 && (
              <div className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm md:flex">
                →
              </div>
            )}

          </div>
        );
      })}

    </div>

  </div>

</section>
        {/* =========================================
            ADD JOB
        ========================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-sm">

          <div className="flex items-start gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Plus size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add Job Opportunity
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Create a new placement opportunity for eligible students.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAddJob}
            className="grid md:grid-cols-2 gap-4"
          >
            {[
              {
                name: "companyName",
                placeholder: "Company Name",
              },
              {
                name: "jobTitle",
                placeholder: "Job Title",
              },
              {
                name: "location",
                placeholder: "Location",
              },
            ].map((field) => (
              <input
                key={field.name}
                name={field.name}
                value={jobForm[field.name]}
                onChange={handleJobChange}
                placeholder={field.placeholder}
                required
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ))}

            <input
              type="number"
              name="package"
              value={jobForm.package}
              onChange={handleJobChange}
              placeholder="Package (LPA)"
              min="0"
              step="0.1"
              required
              className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="number"
              name="minimumCGPA"
              value={jobForm.minimumCGPA}
              onChange={handleJobChange}
              placeholder="Minimum CGPA"
              min="0"
              max="10"
              step="0.1"
              required
              className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              name="applicationDeadline"
              min={new Date().toISOString().split("T")[0]}
              value={jobForm.applicationDeadline}
              onChange={handleJobChange}
              required
              className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              name="requiredSkills"
              value={jobForm.requiredSkills}
              onChange={handleJobChange}
              placeholder="Required Skills: JavaScript, SQL, Python"
              required
              className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <textarea
              name="description"
              value={jobForm.description}
              onChange={handleJobChange}
              placeholder="Job Description"
              rows="4"
              className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-3 rounded-xl font-semibold shadow-sm"
              >
                {saving ? (
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Plus size={19} />
                )}

                {saving
                  ? "Adding..."
                  : "Add Job Opportunity"}
              </button>
            </div>
          </form>
        </section>

        {/* =========================================
            JOB MANAGEMENT
        ========================================= */}

        <section className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Job Management
              </h2>

              <p className="text-slate-500 mt-1">
                Search, filter and manage placement opportunities.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={jobSearch}
                  onChange={(e) =>
                    setJobSearch(e.target.value)
                  }
                  placeholder="Search jobs..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <select
                value={jobStatusFilter}
                onChange={(e) =>
                  setJobStatusFilter(e.target.value)
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">
                  All Status
                </option>
                <option value="open">
                  Open
                </option>
                <option value="closed">
                  Closed
                </option>
              </select>

              {(jobSearch ||
                jobStatusFilter !== "all" ||
                studentSearch ||
                studentCgpaFilter !== "all" ||
                applicationSearch ||
                applicationStatusFilter !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                  title="Clear all search and filter fields across Jobs, Students and Applications"
                >
                  <FilterX size={16} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">
                Open Opportunities
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {openJobs}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500">
                Closed Opportunities
              </p>
              <p className="text-xl font-bold text-slate-600">
                {closedJobs}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">

                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Company
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Position
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Package
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Eligibility
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Deadline
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredJobs.map((job) => {
                    const isEditing =
                      editingJob === job._id;

                    const deadlineState =
                      getDeadlineState(
                        job.applicationDeadline
                      );

                    return (
                      <tr
                        key={job._id}
                        className="align-top hover:bg-slate-50/60"
                      >
                        {isEditing ? (
                          <td
                            colSpan="7"
                            className="p-0"
                          >
                            <div className="bg-indigo-50/50 border-y border-indigo-100 p-5 sm:p-6">

                              <div className="flex items-start justify-between gap-4 mb-5">
                                <div>
                                  <h3 className="font-bold text-slate-900 text-lg">
                                    Edit Job Opportunity
                                  </h3>

                                  <p className="text-sm text-slate-500 mt-1">
                                    Update job details and eligibility criteria.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="p-2 rounded-lg hover:bg-white text-slate-500"
                                >
                                  <X size={20} />
                                </button>
                              </div>

                              <form
                                onSubmit={
                                  handleUpdateJob
                                }
                                className="grid md:grid-cols-2 gap-4"
                              >
                                <input
                                  name="companyName"
                                  value={
                                    editForm.companyName
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Company Name"
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  name="jobTitle"
                                  value={
                                    editForm.jobTitle
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Job Title"
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  name="location"
                                  value={
                                    editForm.location
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Location"
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  type="number"
                                  name="package"
                                  value={
                                    editForm.package
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Package (LPA)"
                                  min="0"
                                  step="0.1"
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  type="number"
                                  name="minimumCGPA"
                                  value={
                                    editForm.minimumCGPA
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Minimum CGPA"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  type="date"
                                  name="applicationDeadline"
                                  min={new Date().toISOString().split("T")[0]}
                                  value={
                                    editForm.applicationDeadline
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  required
                                  className="px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <input
                                  name="requiredSkills"
                                  value={
                                    editForm.requiredSkills
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="JavaScript, SQL, Python"
                                  required
                                  className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <textarea
                                  name="description"
                                  value={
                                    editForm.description
                                  }
                                  onChange={
                                    handleEditChange
                                  }
                                  placeholder="Job Description"
                                  rows="3"
                                  className="md:col-span-2 px-4 py-3 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                />

                                <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={
                                      cancelEditing
                                    }
                                    className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold"
                                  >
                                    {saving ? (
                                      <RefreshCw
                                        size={17}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Save
                                        size={17}
                                      />
                                    )}

                                    {saving
                                      ? "Saving..."
                                      : "Save Changes"}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-5 py-5">
                              <div className="font-bold text-indigo-600">
                                {job.companyName}
                              </div>

                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                <MapPin size={13} />
                                {job.location || "—"}
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <div className="font-semibold text-slate-800">
                                {job.jobTitle}
                              </div>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.requiredSkills
                                  ?.slice(0, 3)
                                  .map(
                                    (skill, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px]"
                                      >
                                        {skill}
                                      </span>
                                    )
                                  )}
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <div className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                                <IndianRupee size={14} />
                                {job.package} LPA
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <div className="inline-flex items-center gap-1 text-slate-600 text-sm">
                                <GraduationCap
                                  size={15}
                                />
                                {job.minimumCGPA}
                              </div>
                            </td>

                            <td className="px-5 py-5">
                              <div
                                className={`inline-flex items-center gap-1.5 text-sm ${
                                  deadlineState ===
                                  "expired"
                                    ? "text-red-600"
                                    : deadlineState ===
                                      "urgent"
                                    ? "text-orange-600"
                                    : "text-slate-500"
                                }`}
                              >
                                <CalendarDays
                                  size={15}
                                />

                                {formatDate(
                                  job.applicationDeadline
                                )}
                              </div>

                              {deadlineState ===
                                "expired" && (
                                <p className="text-[11px] text-red-600 font-semibold mt-1">
                                  Expired
                                </p>
                              )}

                              {deadlineState ===
                                "urgent" && (
                                <p className="text-[11px] text-orange-600 font-semibold mt-1">
                                  Deadline near
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                                  job.status ===
                                  "open"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    job.status ===
                                    "open"
                                      ? "bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />
                                {job.status ===
                                "open"
                                  ? "Open"
                                  : "Closed"}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <div className="flex flex-wrap gap-2">

                                <button
                                  onClick={() =>
                                    startEditing(job)
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold"
                                >
                                  <Pencil
                                    size={14}
                                  />
                                  Edit
                                </button>

                                {job.status ===
                                "open" ? (
                                  <button
                                    onClick={() =>
                                      askConfirmation({
                                        title:
                                          "Close this job?",
                                        message:
                                          "Students will no longer be able to apply to this opportunity.",
                                        confirmText:
                                          "Close Job",
                                        danger: true,
                                        action: () =>
                                          handleCloseJob(
                                            job._id
                                          ),
                                      })
                                    }
                                    disabled={
                                      closingJob ===
                                      job._id
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 text-xs font-bold"
                                  >
                                    <Lock
                                      size={14}
                                    />
                                    {closingJob ===
                                    job._id
                                      ? "Closing..."
                                      : "Close"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      askConfirmation({
                                        title:
                                          "Reopen this job?",
                                        message:
                                          "This opportunity will become available to students again.",
                                        confirmText:
                                          "Reopen Job",
                                        action: () =>
                                          handleReopenJob(
                                            job._id
                                          ),
                                      })
                                    }
                                    disabled={
                                      reopeningJob ===
                                      job._id
                                    }
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 text-xs font-bold"
                                  >
                                    <Unlock
                                      size={14}
                                    />
                                    {reopeningJob ===
                                    job._id
                                      ? "Reopening..."
                                      : "Reopen"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}

                  {filteredJobs.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-14 text-center"
                      >
                        <Briefcase
                          size={32}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No jobs found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Try changing your search or filter.
                        </p>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================
            STUDENTS
        ========================================= */}

        <section className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Registered Students
              </h2>

              <p className="text-slate-500 mt-1">
                Monitor student profiles and placement readiness.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={studentSearch}
                  onChange={(e) =>
                    setStudentSearch(e.target.value)
                  }
                  placeholder="Search students..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <select
                value={studentCgpaFilter}
                onChange={(e) =>
                  setStudentCgpaFilter(e.target.value)
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">
                  All CGPA
                </option>
                <option value="9+">
                  CGPA 9+
                </option>
                <option value="8-8.99">
                  CGPA 8–8.99
                </option>
                <option value="7-7.99">
                  CGPA 7–7.99
                </option>
                <option value="below7">
                  Below 7
                </option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">

                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      CGPA
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Skills
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Readiness
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredStudents.map(
                    (student) => {
                      const readiness =
                        getReadiness(student.cgpa);

                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-slate-50/60"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "S"}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {student.name ||
                                    "—"}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                  {student.email ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                              <GraduationCap
                                size={14}
                              />
                              {student.cgpa ??
                                "—"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-wrap gap-1.5 max-w-lg">
                              {student.skills?.length ? (
                                student.skills.map(
                                  (
                                    skill,
                                    index
                                  ) => (
                                    <span
                                      key={
                                        index
                                      }
                                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600"
                                    >
                                      {skill}
                                    </span>
                                  )
                                )
                              ) : (
                                <span className="text-sm text-slate-400">
                                  No skills added
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${readiness.classes}`}
                            >
                              {readiness.text}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}

                  {filteredStudents.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-14 text-center"
                      >
                        <Users
                          size={32}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No students found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Try changing your search or CGPA filter.
                        </p>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden mt-3 space-y-3">
            {filteredStudents.map((student) => {
              const readiness = getReadiness(student.cgpa);
              return (
                <article key={`mobile-${student._id}`} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                        {student.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{student.name || "—"}</p>
                        <p className="text-xs text-slate-500 truncate">{student.email || "—"}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${readiness.classes}`}>{readiness.text}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs"><GraduationCap size={13} />{student.cgpa ?? "—"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {student.skills?.length ? student.skills.map((skill, index) => <span key={index} className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 text-slate-600">{skill}</span>) : <span className="text-xs text-slate-400">No skills added</span>}
                  </div>
                </article>
              );
            })}
            {filteredStudents.length === 0 && <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">No students found</div>}
          </div>
        </section>

        {/* =========================================
            APPLICATIONS
        ========================================= */}

        <section>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Placement Applications
              </h2>

              <p className="text-slate-500 mt-1">
                Review applications and manage selection status.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={applicationSearch}
                  onChange={(e) =>
                    setApplicationSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search applications..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <select
                value={applicationStatusFilter}
                onChange={(e) =>
                  setApplicationStatusFilter(
                    e.target.value
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">
                  All Applications
                </option>
                <option value="applied">
                  Applied
                </option>
                <option value="shortlisted">
                  Shortlisted
                </option>
                <option value="selected">
                  Selected
                </option>
                <option value="rejected">
                  Rejected
                </option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">

                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Company
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Position
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Update
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredApplications.map(
                    (application) => (
                      <tr
                        key={application._id}
                        className="hover:bg-slate-50/60"
                      >

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                              {application.student?.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {application.student
                                  ?.name ||
                                  "—"}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {application.student
                                  ?.email ||
                                  "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-indigo-600">
                            {application.company
                              ?.companyName ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-medium text-slate-700">
                            {application.company
                              ?.jobTitle ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${getStatusClasses(
                              application.status
                            )}`}
                          >
                            {application.status ||
                              "applied"}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <div className="relative inline-flex">
                            <select
                              value={
                                application.status
                              }
                              onChange={(e) => {
                                const newStatus =
                                  e.target.value;

                                if (
                                  newStatus ===
                                  application.status
                                ) {
                                  return;
                                }

                                askConfirmation({
                                  title:
                                    "Update application status?",
                                  message: `Change this application from "${application.status}" to "${newStatus}".`,
                                  confirmText:
                                    "Update Status",
                                  action: () =>
                                    updateStatus(
                                      application._id,
                                      newStatus
                                    ),
                                });
                              }}
                              className="appearance-none pr-9 pl-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="applied">
                                Applied
                              </option>

                              <option value="shortlisted">
                                Shortlisted
                              </option>

                              <option value="selected">
                                Selected
                              </option>

                              <option value="rejected">
                                Rejected
                              </option>
                            </select>

                            <ChevronDown
                              size={15}
                              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                            />
                          </div>
                        </td>

                      </tr>
                    )
                  )}

                  {filteredApplications.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-14 text-center"
                      >
                        <FileText
                          size={32}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-semibold text-slate-700">
                          No applications found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                          Try changing your search or status filter.
                        </p>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden mt-3 space-y-3">
            {filteredApplications.map((application) => (
              <article key={`mobile-${application._id}`} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">{application.student?.name?.charAt(0)?.toUpperCase() || "S"}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{application.student?.name || "—"}</p>
                      <p className="text-xs text-slate-500 truncate">{application.student?.email || "—"}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusClasses(application.status)}`}>{application.status || "applied"}</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Company</p><p className="font-semibold text-indigo-600 truncate mt-1">{application.company?.companyName || "—"}</p></div>
                  <div><p className="text-[11px] uppercase tracking-wide text-slate-400 font-bold">Position</p><p className="font-medium text-slate-700 truncate mt-1">{application.company?.jobTitle || "—"}</p></div>
                </div>
                <div className="mt-4 relative">
                  <select value={application.status} onChange={(e) => { const newStatus = e.target.value; if (newStatus === application.status) return; askConfirmation({ title: "Update application status?", message: `Change this application from "${application.status}" to "${newStatus}".`, confirmText: "Update Status", action: () => updateStatus(application._id, newStatus) }); }} className="w-full appearance-none pr-9 pl-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="applied">Applied</option><option value="shortlisted">Shortlisted</option><option value="selected">Selected</option><option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </article>
            ))}
            {filteredApplications.length === 0 && <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">No applications found</div>}
          </div>
        </section>

        {/* =========================================
            FOOTER SUMMARY
        ========================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Open Opportunities
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {openJobs}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Registered Students
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={19} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Students Selected
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {selectedCount}
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* =========================================
          CONFIRMATION MODAL
      ========================================= */}

      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() =>
              setConfirmModal(null)
            }
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">

            <div className="flex items-start gap-4">

              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmModal.danger
                    ? "bg-red-50 text-red-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {confirmModal.danger ? (
                  <AlertCircle size={22} />
                ) : (
                  <CheckCircle size={22} />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {confirmModal.title}
                </h3>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  {confirmModal.message}
                </p>
              </div>

            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-7">

              <button
                type="button"
                onClick={() =>
                  setConfirmModal(null)
                }
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  confirmModal.action()
                }
                className={`px-5 py-2.5 rounded-xl text-white font-semibold ${
                  confirmModal.danger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {confirmModal.confirmText}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;