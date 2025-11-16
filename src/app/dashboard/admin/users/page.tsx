"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UsersIcon,
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
  coursesEnrolled?: number;
  coursesCreated?: number;
}

interface UserStats {
  totalUsers: number;
  students: number;
  instructors: number;
  admins: number;
}

interface UserFormData {
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  password?: string;
}

// UserModal component (moved outside)
const UserModal = ({ 
  isOpen, 
  onClose, 
  isEditMode, 
  user,
  formData,
  setFormData,
  isSubmitting,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  user?: User | null;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-lg mx-auto transform transition-all">
<div className="relative z-10 w-full max-w-lg mx-auto p-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl animate-slideUp text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? "Edit User" : "Add New User"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditMode ? "Update user details." : "Fill in the details to add a new user."}
                </p>
              </div>

              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    required
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value as "student" | "instructor" | "admin" })
                    }
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                  >
                    
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {!isEditMode && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      required={!isEditMode}
                      value={formData.password || ""}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      placeholder="Enter password"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// DeleteModal component (moved outside)
const DeleteModal = ({ 
  confirm, 
  cancel, 
  deleteConfirm 
}: { 
  confirm: () => void; 
  cancel: () => void;
  deleteConfirm: { id: string; name: string } | null;
}) => {
  if (!deleteConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={cancel} />

      <div className="relative z-10 w-full max-w-md mx-auto p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/30 p-6 animate-slideUp">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete user</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to delete <span className="font-medium">{deleteConfirm.name}</span>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={cancel} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={confirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "instructor" | "admin"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "student",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Toast (for success/error ephemeral messages)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const navigation = [
    { name: "Dashboard", href: "/dashboard/admin", icon: ChartBarIcon, current: false },
    { name: "User Management", href: "/dashboard/admin/users", icon: UsersIcon, current: true },
    { name: "Course Management", href: "/dashboard/admin/courses", icon: BookOpenIcon, current: false },
    { name: "System Settings", href: "/dashboard/admin/settings", icon: CogIcon, current: false },
  ];

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await fetch("/dashboard/admin/api/users");

      if (!response.ok) {
        throw new Error("Failed to fetch users data");
      }

      const data = await response.json();
      setUsers(data.users);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users data. Please try again.");
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration (keeps your original mock)
  const loadMockData = () => {
    const mockUsers: User[] = [
      {
        _id: "1",
        name: "John Smith",
        email: "john.smith@example.com",
        role: "student",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        coursesEnrolled: 5,
      },
      {
        _id: "2",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        role: "instructor",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        coursesCreated: 3,
      },
      {
        _id: "3",
        name: "Mike Chen",
        email: "mike.chen@example.com",
        role: "admin",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: "4",
        name: "Emily Davis",
        email: "emily.davis@example.com",
        role: "student",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        coursesEnrolled: 2,
      },
      {
        _id: "5",
        name: "Dr. Robert Wilson",
        email: "robert.w@example.com",
        role: "instructor",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        coursesCreated: 8,
      },
    ];

    const mockStats: UserStats = {
      totalUsers: 2458,
      students: 1890,
      instructors: 48,
      admins: 3,
    };

    setUsers(mockUsers);
    setStats(mockStats);
  };

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/auth/signin");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role !== "admin") {
          router.push("/");
          return;
        }

        await fetchUsers();
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Add User Functions
  const handleAddUser = () => {
    setFormData({
      name: "",
      email: "",
      role: "student",
      password: "",
    });
    setShowAddModal(true);
  };

  const handleSubmitAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/dashboard/admin/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      // Refresh the users list to get the updated data
      await fetchUsers();
      setShowAddModal(false);
      setFormData({ name: "", email: "", role: "student", password: "" });

      showToast("User added successfully!", "success");
    } catch (error) {
      console.error("Error adding user:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to add user. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit User Functions
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "", // Don't pre-fill password for security
    });
    setShowEditModal(true);
  };

  const handleSubmitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/dashboard/admin/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser._id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user");
      }

      // Refresh the users list to get the updated data
      await fetchUsers();
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({ name: "", email: "", role: "student", password: "" });

      showToast("User updated successfully!", "success");
    } catch (error) {
      console.error("Error updating user:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to update user. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User (now shows confirmation modal)
  const handleDeleteUser = (userId: string, userName: string) => {
    // open the delete confirmation modal
    setDeleteConfirm({ id: userId, name: userName });
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/dashboard/admin/api/users?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      // Refresh the users list to get the updated data
      await fetchUsers();
      showToast("User deleted successfully!", "success");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        "error"
      );
    }
  };

  const handleViewUser = (userId: string) => {
    // Implement view user details if needed
    console.log("View user:", userId);
    showToast("View user functionality to be implemented", "success");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl text-white animate-slideUp ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      {/* Add/Edit User Modals */}
      <UserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        isEditMode={false}
        user={null}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitAddUser}
      />
      
      <UserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        isEditMode={true}
        user={selectedUser}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitEditUser}
      />

      {/* Delete Modal */}
      <DeleteModal 
        confirm={confirmDeleteUser} 
        cancel={() => setDeleteConfirm(null)}
        deleteConfirm={deleteConfirm}
      />

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub - Admin</h1>
              <button onClick={() => setSidebarOpen(false)} className="p-2">
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="p-6 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${item.current ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              ))}
              <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-4">
                <ShieldCheckIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold text-blue-600">LearnAI Hub - Admin</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button onClick={() => router.push(item.href)} className={`flex items-center w-full p-3 rounded-lg transition-colors group ${item.current ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}>
                        <item.icon className={`h-5 w-5 mr-3 ${item.current ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group">
                  <ShieldCheckIcon className="h-5 w-5 mr-3 text-red-400" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-700">Admin</span>
              <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">Logout</button>
            </div>
          </div>
        </div>

        {/* User Management content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">User Management</h1>
                  <p className="text-blue-100 text-lg">Manage all platform users, their roles and permissions.</p>
                </div>
                <button onClick={handleAddUser} className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New User
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: "Total Users", value: stats.totalUsers, icon: UsersIcon, color: "blue" },
                  { name: "Students", value: stats.students, icon: UserGroupIcon, color: "green" },
                  { name: "Instructors", value: stats.instructors, icon: UsersIcon, color: "purple" },
                  { name: "Admins", value: stats.admins, icon: ShieldCheckIcon, color: "red" },
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-${item.color}-100`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{item.name}</p>
                        <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters and Search */}
<div className="bg-white rounded-lg shadow border border-gray-200 p-6">
  <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
    <div className="flex-1">
      <div className="relative">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-500"
        />
      </div>
    </div>
    <div className="flex gap-4">
      <select
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value as any)}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
      >
        <option value="all">All Roles</option>
        <option value="student">Students</option>
        <option value="instructor">Instructors</option>
        <option value="admin">Admins</option>
      </select>
    </div>
  </div>
</div>


            {/* Users Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Users ({filteredUsers.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">
                                  {user.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button onClick={() => handleEditUser(user)} className="text-green-600 hover:text-green-900 transition-colors" title="Edit User">
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button onClick={() => handleDeleteUser(user._id, user.name)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete User">
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          <UsersIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="mt-1">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{" "}
                      <span className="font-medium">{filteredUsers.length}</span> users
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button key={page} onClick={() => handlePageChange(page)} className={`px-3 py-1 border text-sm font-medium rounded-md ${currentPage === page ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                          {page}
                        </button>
                      ))}

                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Inline small animation CSS so modal animations work without extra files */}
      <style jsx global>{`
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 220ms cubic-bezier(.2,.8,.2,1); }
      `}</style>
    </div>
  );
}