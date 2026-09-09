import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle,
  Clock,
  XCircle,
  UserCircle,
  MapPin,
  IndianRupee,
  GraduationCap,
  RefreshCw,
  Search,
  Filter,
  RotateCcw,
  CalendarDays,
  AlertTriangle,
  FileText,
  TrendingUp,
  ShieldCheck,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [eligibleOnly, setEligibleOnly] = useState(false);

  // --------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [profileRes, jobsRes, applicationsRes] =
        await Promise.all([
          api.get("/student/profile"),
          api.get("/company"),
          api.get("/application/my"),
        ]);

      setProfile(profileRes.data.user);

      setJobs(
        Array.isArray(jobsRes.data.companies)
          ? jobsRes.data.companies
          : []
      );

      setApplications(
        Array.isArray(applicationsRes.data.applications)
          ? applicationsRes.data.applications
          : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    fetchData();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const normalizeStatus = (status) =>
    String(status || "").toLowerCase().trim();

  const getApplicationForJob = (companyId) => {
    return applications.find(
      (application) =>
        application.company?._id === companyId ||
        application.companyId === companyId
    );
  };

  // --------------------------------------------------
  // ELIGIBILITY
  // --------------------------------------------------

  const getEligibilityDetails = (job) => {
    const studentCGPA = Number(profile?.cgpa || 0);
    const minimumCGPA = Number(job.minimumCGPA || 0);

    const cgpaEligible = studentCGPA >= minimumCGPA;

    const studentSkills = (profile?.skills || []).map(
      (skill) => String(skill).toLowerCase().trim()
    );

    const requiredSkills = Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : [];

    const missingSkills = requiredSkills.filter(
      (skill) =>
        !studentSkills.includes(
          String(skill).toLowerCase().trim()
        )
    );

    const skillsEligible = missingSkills.length === 0;

    return {
      cgpaEligible,
      skillsEligible,
      eligible: cgpaEligible && skillsEligible,
      missingSkills,
      studentCGPA,
      minimumCGPA,
    };
  };

  const checkEligibility = (job) =>
    getEligibilityDetails(job).eligible;

  // --------------------------------------------------
  // DEADLINE
  // --------------------------------------------------

  const getDeadlineInfo = (deadline) => {
    if (!deadline) {
      return {
        expired: false,
        closingSoon: false,
        daysLeft: null,
        label: "No deadline",
      };
    }

    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      return {
        expired: false,
        closingSoon: false,
        daysLeft: null,
        label: "Invalid deadline",
      };
    }

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const deadlineDay = new Date(
      deadlineDate.getFullYear(),
      deadlineDate.getMonth(),
      deadlineDate.getDate()
    );

    const difference =
      deadlineDay.getTime() - today.getTime();

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return {
      expired: daysLeft < 0,
      closingSoon: daysLeft >= 0 && daysLeft <= 3,
      daysLeft,
      label:
        daysLeft < 0
          ? "Expired"
          : daysLeft === 0
          ? "Deadline today"
          : `${daysLeft} ${
              daysLeft === 1 ? "day" : "days"
            } left`,
    };
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "Not specified";

    const date = new Date(deadline);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatAppliedDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --------------------------------------------------
  // APPLICATION
  // --------------------------------------------------

  const handleApply = async (companyId) => {
    try {
      setApplying(companyId);
      setError("");
      setMessage("");

      const response = await api.post("/application", {
        companyId,
      });

      setMessage(
        response.data.message ||
          "Application submitted successfully."
      );

      await fetchData(true);
    } catch (err) {
      setError(
        err.response?.data?.reason ||
          err.response?.data?.message ||
          "Unable to submit application."
      );
    } finally {
      setApplying("");
    }
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatusStyle = (status) => {
    const normalized = normalizeStatus(status);

    const styles = {
      applied: "bg-blue-50 text-blue-700 border-blue-100",
      shortlisted:
        "bg-amber-50 text-amber-700 border-amber-100",
      selected:
        "bg-green-50 text-green-700 border-green-100",
      rejected:
        "bg-red-50 text-red-700 border-red-100",
    };

    return (
      styles[normalized] ||
      "bg-slate-100 text-slate-700 border-slate-200"
    );
  };

  const getStatusIcon = (status) => {
    const normalized = normalizeStatus(status);

    if (normalized === "selected") {
      return <CheckCircle size={15} />;
    }

    if (normalized === "rejected") {
      return <XCircle size={15} />;
    }

    if (normalized === "shortlisted") {
      return <Clock size={15} />;
    }

    return <Briefcase size={15} />;
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    const value = String(status).toLowerCase();

    return (
      value.charAt(0).toUpperCase() + value.slice(1)
    );
  };

  // --------------------------------------------------
  // PROFILE
  // --------------------------------------------------

  const profileChecks = [
    Boolean(profile?.name),
    Boolean(profile?.email),
    Number(profile?.cgpa) > 0,
    Boolean(profile?.skills?.length),
    Boolean(profile?.resumeLink),
  ];

  const completedProfileFields =
    profileChecks.filter(Boolean).length;

  const profileCompleteness = Math.round(
    (completedProfileFields / profileChecks.length) * 100
  );

  const placementReadiness =
    profileCompleteness === 100 &&
    Number(profile?.cgpa || 0) > 0 &&
    (profile?.skills?.length || 0) > 0;

  // --------------------------------------------------
  // APPLICATION SUMMARY
  // --------------------------------------------------

  const appliedCount = applications.filter(
    (application) =>
      normalizeStatus(application.status) === "applied"
  ).length;

  const shortlistedCount = applications.filter(
    (application) =>
      normalizeStatus(application.status) === "shortlisted"
  ).length;

  const selectedCount = applications.filter(
    (application) =>
      normalizeStatus(application.status) === "selected"
  ).length;

  const rejectedCount = applications.filter(
    (application) =>
      normalizeStatus(application.status) === "rejected"
  ).length;

  // --------------------------------------------------
  // AVAILABLE JOBS
  // --------------------------------------------------

  const availableJobs = useMemo(() => {
    return jobs.filter((job) => {
      const status = normalizeStatus(job.status);

      if (status && status !== "open") {
        return false;
      }

      const deadlineInfo = getDeadlineInfo(
        job.applicationDeadline
      );

      return !deadlineInfo.expired;
    });
  }, [jobs]);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const locations = [
    ...new Set(
      availableJobs
        .map((job) => job.location)
        .filter(Boolean)
    ),
  ].sort();

  const filteredJobs = availableJobs.filter((job) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      job.companyName?.toLowerCase().includes(search) ||
      job.jobTitle?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.requiredSkills?.some((skill) =>
        String(skill).toLowerCase().includes(search)
      );

    const matchesLocation =
      locationFilter === "all" ||
      job.location === locationFilter;

    const packageValue = Number(job.package || 0);

    const matchesPackage =
      packageFilter === "all" ||
      (packageFilter === "3" && packageValue >= 3) ||
      (packageFilter === "5" && packageValue >= 5) ||
      (packageFilter === "7" && packageValue >= 7);

    const matchesEligibility =
      !eligibleOnly || checkEligibility(job);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesPackage &&
      matchesEligibility
    );
  });

  const resetFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setPackageFilter("all");
    setEligibleOnly(false);
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <RefreshCw
                className="animate-spin"
                size={24}
              />
            </div>

            <div className="text-center">
              <p className="font-semibold text-slate-800">
                Loading your dashboard
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Please wait a moment...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ==============================================
            HEADER
        ============================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wide">
                STUDENT PORTAL
              </span>

              {placementReadiness && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                  <ShieldCheck size={13} />
                  Placement Ready
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3">
              Welcome,{" "}
              {profile?.name || user?.name || "Student"}!
            </h1>

            <p className="text-slate-500 mt-2 max-w-2xl">
              Discover suitable opportunities, apply with
              confidence, and track your placement journey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">

            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              <RefreshCw
                size={18}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm"
            >
              <UserCircle size={19} />
              Update Profile
            </Link>

          </div>
        </div>

        {/* ==============================================
            ALERTS
        ============================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
            <CheckCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <p className="text-sm font-medium">
              {message}
            </p>
          </div>
        )}

        {/* ==============================================
            TOP STATS
        ============================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

          {/* CGPA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <GraduationCap size={23} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                ACADEMICS
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Current CGPA
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {profile?.cgpa || "0.0"}
            </p>
          </div>

          {/* JOBS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Briefcase size={23} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                OPPORTUNITIES
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Available Jobs
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {availableJobs.length}
            </p>
          </div>

          {/* APPLICATIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp size={23} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                PROGRESS
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Total Applications
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {applications.length}
            </p>
          </div>

          {/* PROFILE */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award size={23} />
              </div>

              <span className="text-xs font-semibold text-slate-400">
                PROFILE
              </span>
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Profile Completion
            </p>

            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {profileCompleteness}%
              </p>

              {placementReadiness && (
                <span className="text-xs text-green-600 font-semibold mb-1">
                  Ready
                </span>
              )}
            </div>
          </div>

        </div>

        {/* ==============================================
            PROFILE COMPLETENESS
        ============================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Profile Completeness
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  A complete profile improves your job
                  eligibility and placement visibility.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">

              <div className="w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                  style={{
                    width: `${profileCompleteness}%`,
                  }}
                />
              </div>

              <div className="text-right min-w-16">
                <p className="text-xl font-bold text-indigo-600">
                  {profileCompleteness}%
                </p>

                <p className="text-xs text-slate-500">
                  {completedProfileFields}/5
                </p>
              </div>

            </div>

          </div>

          {profileCompleteness < 100 ? (
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Complete your profile
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Make sure your skills and resume are
                  added before applying.
                </p>
              </div>

              <Link
                to="/profile"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Complete Profile
                <ChevronRight size={16} />
              </Link>

            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 p-4 text-sm font-semibold text-green-700">
              <ShieldCheck size={18} />
              Your profile is complete and ready for
              placement opportunities.
            </div>
          )}

        </div>

        {/* ==============================================
            APPLICATION OVERVIEW
        ============================================== */}

        <section className="mb-8">

          <div className="mb-5">
            <div className="flex items-center gap-2">
              <Sparkles
                size={19}
                className="text-indigo-600"
              />

              <h2 className="text-xl font-bold text-slate-900">
                Application Overview
              </h2>
            </div>

            <p className="text-sm text-slate-500 mt-1">
              Track where you currently stand in the
              placement process.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Applied */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Briefcase size={20} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                  {appliedCount}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-4">
                Applied
              </p>
            </div>

            {/* Shortlisted */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Clock size={20} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                  {shortlistedCount}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-4">
                Shortlisted
              </p>
            </div>

            {/* Selected */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-green-50 text-green-600">
                  <CheckCircle size={20} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                  {selectedCount}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-4">
                Selected
              </p>
            </div>

            {/* Rejected */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                  <XCircle size={20} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                  {rejectedCount}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-4">
                Rejected
              </p>
            </div>

          </div>
        </section>

        {/* ==============================================
            SKILLS
        ============================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Skills
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                These skills are used for automatic job
                eligibility.
              </p>
            </div>

            <Link
              to="/profile"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Edit Skills →
            </Link>

          </div>

          <div className="flex flex-wrap gap-2">
            {profile?.skills?.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm font-medium"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  No skills added yet.
                </p>

                <Link
                  to="/profile"
                  className="inline-block mt-2 text-sm font-semibold text-indigo-600"
                >
                  Add your skills →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ==============================================
            JOB OPPORTUNITIES
        ============================================== */}

        <section className="mb-10">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">

            <div>
              <div className="flex items-center gap-2">
                <Briefcase
                  size={21}
                  className="text-indigo-600"
                />

                <h2 className="text-2xl font-bold text-slate-900">
                  Available Opportunities
                </h2>
              </div>

              <p className="text-slate-500 mt-1">
                Opportunities are automatically checked
                against your CGPA and skills.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">
                {availableJobs.length}
              </span>{" "}
              active opportunities
            </div>

          </div>

          {/* FILTER PANEL */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">

            <div className="flex items-center gap-2 mb-4">
              <Filter
                size={19}
                className="text-indigo-600"
              />

              <h3 className="font-bold text-slate-900">
                Find the right opportunity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Search */}

              <div className="relative lg:col-span-2">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search company, role or skill..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Location */}

              <select
                value={locationFilter}
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
                className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">
                  All Locations
                </option>

                {locations.map((location) => (
                  <option
                    key={location}
                    value={location}
                  >
                    {location}
                  </option>
                ))}
              </select>

              {/* Package */}

              <select
                value={packageFilter}
                onChange={(e) =>
                  setPackageFilter(e.target.value)
                }
                className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">
                  Any Package
                </option>

                <option value="3">3+ LPA</option>
                <option value="5">5+ LPA</option>
                <option value="7">7+ LPA</option>
              </select>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 pt-4 border-t border-slate-100">

              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eligibleOnly}
                  onChange={(e) =>
                    setEligibleOnly(e.target.checked)
                  }
                  className="w-4 h-4 accent-indigo-600"
                />

                <span className="text-sm font-medium text-slate-700">
                  Show only jobs I'm eligible for
                </span>
              </label>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
              >
                <RotateCcw size={16} />
                Reset Filters
              </button>

            </div>
          </div>

          {/* RESULT COUNT */}

          {availableJobs.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filteredJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {availableJobs.length}
                </span>{" "}
                opportunities
              </p>
            </div>
          )}

          {/* NO JOBS */}

          {availableJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Briefcase size={25} />
              </div>

              <h3 className="font-bold text-slate-800 text-lg">
                No active opportunities
              </h3>

              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                There are currently no open opportunities
                available. Check again later.
              </p>

              <button
                type="button"
                onClick={() => fetchData(true)}
                className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
              >
                <RefreshCw size={16} />
                Check Again
              </button>

            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <Search size={22} />
              </div>

              <h3 className="font-bold text-slate-800">
                No matching opportunities
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold"
              >
                <RotateCcw size={16} />
                Reset Filters
              </button>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {filteredJobs.map((job) => {
                const eligibility =
                  getEligibilityDetails(job);

                const application =
                  getApplicationForJob(job._id);

                const applied = Boolean(application);

                const deadlineInfo =
                  getDeadlineInfo(
                    job.applicationDeadline
                  );

                const isExpired =
                  deadlineInfo.expired;

                const jobStatus =
                  normalizeStatus(job.status);

                const isClosed =
                  jobStatus && jobStatus !== "open";

                const cannotApply =
                  !eligibility.eligible ||
                  applied ||
                  isExpired ||
                  isClosed ||
                  applying === job._id;

                return (
                  <article
                    key={job._id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition"
                  >

                    {/* JOB TOP */}

                    <div className="p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <Briefcase size={18} />
                            </div>

                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                              Job Opportunity
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-slate-900">
                            {job.jobTitle}
                          </h3>

                          <p className="text-indigo-600 font-semibold mt-1">
                            {job.companyName}
                          </p>

                        </div>

                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
                            isExpired
                              ? "bg-slate-100 text-slate-500"
                              : isClosed
                              ? "bg-slate-100 text-slate-500"
                              : eligibility.eligible
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : isClosed
                            ? "Closed"
                            : eligibility.eligible
                            ? "Eligible"
                            : "Not Eligible"}
                        </span>

                      </div>

                      {/* APPLICATION STATUS */}

                      {application && (
                        <div className="mt-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyle(
                              application.status
                            )}`}
                          >
                            {getStatusIcon(
                              application.status
                            )}

                            Application:{" "}
                            {formatStatus(
                              application.status
                            )}
                          </span>
                        </div>
                      )}

                      {/* DESCRIPTION */}

                      <p className="text-slate-500 text-sm leading-6 mt-4">
                        {job.description ||
                          "No description provided."}
                      </p>

                      {/* JOB INFO */}

                      <div className="flex flex-wrap gap-3 mt-5">

                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm">
                          <MapPin size={15} />
                          {job.location || "Not specified"}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm">
                          <IndianRupee size={15} />
                          {job.package || "0"} LPA
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm">
                          <GraduationCap size={15} />
                          CGPA {job.minimumCGPA || 0}+
                        </span>

                      </div>

                      {/* DEADLINE */}

                      <div
                        className={`mt-5 rounded-xl border px-4 py-3 ${
                          isExpired
                            ? "bg-slate-50 border-slate-200"
                            : deadlineInfo.closingSoon
                            ? "bg-orange-50 border-orange-200"
                            : "bg-indigo-50 border-indigo-100"
                        }`}
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex items-center gap-2">

                            {isExpired ? (
                              <XCircle
                                size={18}
                                className="text-slate-500"
                              />
                            ) : deadlineInfo.closingSoon ? (
                              <AlertTriangle
                                size={18}
                                className="text-orange-600"
                              />
                            ) : (
                              <CalendarDays
                                size={18}
                                className="text-indigo-600"
                              />
                            )}

                            <div>
                              <p className="text-[10px] font-bold text-slate-500 tracking-wide">
                                APPLICATION DEADLINE
                              </p>

                              <p className="text-sm font-bold text-slate-800">
                                {formatDeadline(
                                  job.applicationDeadline
                                )}
                              </p>
                            </div>

                          </div>

                          <span
                            className={`text-xs font-bold ${
                              isExpired
                                ? "text-slate-500"
                                : deadlineInfo.closingSoon
                                ? "text-orange-600"
                                : "text-indigo-600"
                            }`}
                          >
                            {deadlineInfo.label}
                          </span>

                        </div>
                      </div>

                      {/* ELIGIBILITY */}

                      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-slate-500 tracking-wide">
                            ELIGIBILITY CHECK
                          </p>

                          {eligibility.eligible ? (
                            <CheckCircle
                              size={17}
                              className="text-green-600"
                            />
                          ) : (
                            <AlertTriangle
                              size={17}
                              className="text-red-500"
                            />
                          )}
                        </div>

                        <div className="space-y-3 text-sm">

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-600">
                              CGPA Requirement
                            </span>

                            <span
                              className={`font-bold ${
                                eligibility.cgpaEligible
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {eligibility.studentCGPA} /{" "}
                              {eligibility.minimumCGPA}

                              {eligibility.cgpaEligible
                                ? " ✓"
                                : " ✕"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-600">
                              Required Skills
                            </span>

                            <span
                              className={`font-bold ${
                                eligibility.skillsEligible
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {eligibility.skillsEligible
                                ? "All matched ✓"
                                : `${eligibility.missingSkills.length} missing ✕`}
                            </span>
                          </div>

                        </div>

                        {!eligibility.eligible &&
                          !isExpired &&
                          !isClosed && (
                            <div className="mt-3 pt-3 border-t border-slate-200">

                              {!eligibility.cgpaEligible && (
                                <p className="text-xs text-red-600">
                                  • Your CGPA is below the
                                  required minimum.
                                </p>
                              )}

                              {!eligibility.skillsEligible && (
                                <p className="text-xs text-red-600 mt-1">
                                  • Missing skills:{" "}
                                  {eligibility.missingSkills.join(
                                    ", "
                                  )}
                                </p>
                              )}

                            </div>
                          )}

                        {eligibility.eligible &&
                          !isExpired &&
                          !isClosed && (
                            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs font-semibold text-green-600">
                              <ShieldCheck size={15} />
                              You meet all eligibility
                              requirements.
                            </div>
                          )}

                      </div>

                      {/* REQUIRED SKILLS */}

                      {job.requiredSkills?.length > 0 && (
                        <div className="mt-5">

                          <p className="text-xs font-bold text-slate-500 mb-2 tracking-wide">
                            REQUIRED SKILLS
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {job.requiredSkills.map(
                              (skill, index) => {
                                const matched = (
                                  profile?.skills || []
                                ).some(
                                  (studentSkill) =>
                                    String(studentSkill)
                                      .toLowerCase()
                                      .trim() ===
                                    String(skill)
                                      .toLowerCase()
                                      .trim()
                                );

                                return (
                                  <span
                                    key={`${skill}-${index}`}
                                    className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                                      matched
                                        ? "bg-green-50 text-green-700 border-green-100"
                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    {skill}
                                    {matched && " ✓"}
                                  </span>
                                );
                              }
                            )}

                          </div>
                        </div>
                      )}

                      {/* APPLY BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          handleApply(job._id)
                        }
                        disabled={cannotApply}
                        className={`w-full mt-6 py-3 rounded-xl font-bold transition ${
                          applying === job._id
                            ? "bg-indigo-500 text-white cursor-wait"
                            : isExpired || isClosed
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : applied
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : !eligibility.eligible
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        }`}
                      >
                        {applying === job._id
                          ? "Submitting Application..."
                          : isExpired
                          ? "Application Closed"
                          : isClosed
                          ? "Job Closed"
                          : applied
                          ? `Already Applied • ${formatStatus(
                              application?.status
                            )}`
                          : !eligibility.eligible
                          ? "Not Eligible"
                          : "Apply Now"}
                      </button>

                    </div>
                  </article>
                );
              })}

            </div>
          )}
        </section>

        {/* ==============================================
            MY APPLICATIONS
        ============================================== */}

        <section>

          <div className="mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={21}
                className="text-indigo-600"
              />

              <h2 className="text-2xl font-bold text-slate-900">
                My Applications
              </h2>
            </div>

            <p className="text-slate-500 mt-1">
              Track the latest status of your submitted
              applications.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Briefcase size={25} />
              </div>

              <h3 className="font-bold text-slate-800 text-lg">
                No applications yet
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Explore available opportunities above and
                submit your first application.
              </p>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              {/* DESKTOP TABLE */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Company
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Position
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Applied On
                      </th>

                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {applications.map(
                      (application) => (
                        <tr
                          key={application._id}
                          className="hover:bg-slate-50 transition"
                        >

                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {application.company
                              ?.companyName ||
                              application.companyName ||
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-slate-600">
                            {application.company
                              ?.jobTitle ||
                              application.jobTitle ||
                              "—"}
                          </td>

                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {formatAppliedDate(
                              application.appliedAt
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusStyle(
                                application.status
                              )}`}
                            >
                              {getStatusIcon(
                                application.status
                              )}

                              {formatStatus(
                                application.status
                              )}
                            </span>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>
                </table>

              </div>

              {/* MOBILE APPLICATION CARDS */}

              <div className="md:hidden divide-y divide-slate-100">

                {applications.map(
                  (application) => (
                    <div
                      key={application._id}
                      className="p-5"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {application.company
                              ?.companyName ||
                              application.companyName ||
                              "—"}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {application.company
                              ?.jobTitle ||
                              application.jobTitle ||
                              "—"}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusStyle(
                            application.status
                          )}`}
                        >
                          {getStatusIcon(
                            application.status
                          )}

                          {formatStatus(
                            application.status
                          )}
                        </span>

                      </div>

                      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
                        <CalendarDays size={14} />

                        Applied on{" "}
                        {formatAppliedDate(
                          application.appliedAt
                        )}
                      </div>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

        </section>

        {/* ==============================================
            FOOTER SUMMARY
        ============================================== */}

        <div className="mt-8 rounded-2xl bg-slate-900 text-white p-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <p className="text-sm text-slate-400">
                Placement Progress
              </p>

              <h3 className="text-xl font-bold mt-1">
                Keep building your profile and applying
                consistently.
              </h3>
            </div>

            <div className="flex flex-wrap gap-5 text-sm">

              <div>
                <p className="text-slate-400">
                  Applications
                </p>

                <p className="font-bold text-lg">
                  {applications.length}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Shortlisted
                </p>

                <p className="font-bold text-lg">
                  {shortlistedCount}
                </p>
              </div>

              <div>
                <p className="text-slate-400">
                  Selected
                </p>

                <p className="font-bold text-lg">
                  {selectedCount}
                </p>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;