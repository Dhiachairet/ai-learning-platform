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
  CheckBadgeIcon,
  XCircleIcon,
  InformationCircleIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface CourseMaterial {
  type: 'pdf' | 'image' | 'youtube';
  url: string;
  title: string;
  description: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  category: string;
  level: "beginner" | "intermediate" | "advanced";
 
  studentsEnrolled: number;
  rating: number;
  status: "draft" | "pending" | "approved" | "rejected" | "reported";
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  materials: CourseMaterial[];
  quizzes: QuizQuestion[];
}

interface CourseStats {
  totalCourses: number;
  pendingCourses: number;
  approvedCourses: number;
  rejectedCourses: number;
  reportedCourses: number;
  totalEnrollments: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}
// Course Details Modal
const CourseDetailsModal = ({ 
  course, 
  onClose 
}: { 
  course: Course | null; 
  onClose: () => void;
}) => {
  if (!course) return null;

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <DocumentIcon className="h-5 w-5 text-red-500" />;
      case 'image':
        return <PhotoIcon className="h-5 w-5 text-green-500" />;
      case 'youtube':
        return <FilmIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'PDF Document';
      case 'image':
        return 'Image';
      case 'youtube':
        return 'YouTube Video';
      default:
        return 'File';
    }
  };

  const handleMaterialClick = (material: CourseMaterial) => {
    if (material.type === 'youtube') {
      // Open YouTube video in new tab
      window.open(material.url, '_blank');
    } else {
      // Open uploaded files in new tab
      window.open(material.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
     <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/30 p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Course Details</h3>
              <p className="text-sm text-gray-500 mt-1">Complete information about the course</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
<div className="space-y-6">
  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
  
  {/* Thumbnail Display */}
  {course.thumbnail && (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Course Thumbnail</label>
      <div className="flex items-center space-x-4">
        <img 
          src={course.thumbnail} 
          alt={`${course.title} thumbnail`}
          className="h-40 w-56 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="text-xs text-gray-500">
          <p>Uploaded thumbnail preview</p>
          <p className="mt-1 truncate max-w-xs">{course.thumbnail.split('/').pop()}</p>
        </div>
      </div>
    </div>
  )}
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
    <p className="mt-1 text-sm text-gray-900 font-medium">{course.title}</p>
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
    <p className="mt-1 text-sm text-gray-900">{course.description}</p>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
      <p className="mt-1 text-sm text-gray-900">{course.category}</p>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
      </span>
    </div>
  </div>
</div>

            {/* Instructor & Status */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b pb-2">Instructor & Status</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                <p className="mt-1 text-sm text-gray-900">{course.instructor.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Email</label>
                <p className="mt-1 text-sm text-gray-900">{course.instructor.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Students Enrolled</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                    {(course.studentsEnrolled || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {course.rating > 0 ? `${course.rating}/5.0` : 'No ratings yet'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(course.createdAt)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(course.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Course Materials Section */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
              
              Course Materials ({course.materials?.length || 0})
            </h4>
            
            {course.materials && course.materials.length > 0 ? (
              <div className="space-y-3">
                {course.materials.map((material, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {getMaterialIcon(material.type)}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{material.title}</div>
                        <div className="text-xs text-gray-500 flex items-center space-x-2">
                          <span className="uppercase">{getMaterialTypeLabel(material.type)}</span>
                          {material.description && (
                            <>
                              <span>•</span>
                              <span>{material.description}</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 truncate">
                          {material.type === 'youtube' ? 'YouTube Video' : material.url.split('/').pop()}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Click to view
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DocumentIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No course materials uploaded yet</p>
              </div>
            )}
          </div>
          {/* Quiz Section */}
<div className="mt-6">
  <h4 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">
    Course Quiz ({course.quizzes?.length || 0} questions)
  </h4>
  
  {course.quizzes && course.quizzes.length > 0 ? (
    <div className="space-y-4">
      {course.quizzes.map((quiz, index) => (
        <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                Q{index + 1}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                {quiz.question}
              </h5>
              <div className="space-y-2">
                {quiz.options.map((option, optIndex) => (
                  <div 
                    key={optIndex} 
                    className={`flex items-start p-2 rounded-md ${
                      optIndex === quiz.correctAnswer 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center h-5 mr-3">
                      <div className={`h-3 w-3 rounded-full ${
                        optIndex === quiz.correctAnswer 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`} />
                    </div>
                    <span className={`text-sm ${
                      optIndex === quiz.correctAnswer 
                        ? 'text-green-700 font-medium' 
                        : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                    {optIndex === quiz.correctAnswer && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Correct Answer
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm">No quiz questions added for this course</p>
      <p className="text-xs text-gray-400 mt-1">Instructors can add quizzes when creating or editing courses</p>
    </div>
  )}
</div>

        

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// DeleteModal component
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
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

// Helper functions (moved outside component)
const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "beginner":
      return "bg-blue-100 text-blue-800";
    case "intermediate":
      return "bg-purple-100 text-purple-800";
    case "advanced":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CourseManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "reported">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);

  // Modal states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    { name: "User Management", href: "/dashboard/admin/users", icon: UsersIcon, current: false },
    { name: "Course Management", href: "/dashboard/admin/courses", icon: BookOpenIcon, current: true },
    
  ];

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      setError(null);
      const response = await fetch("/dashboard/admin/api/courses");

      if (!response.ok) {
        throw new Error("Failed to fetch courses data");
      }

      const data = await response.json();
      setCourses(data.courses);
      setStats(data.stats);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses data. Please try again.");
     
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration (with materials)
 

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
        if (payload.name) {
          setUserName(payload.name);
        }
        if (payload.role !== "admin") {
          router.push("/");
          return;
        }

        await fetchCourses();
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem("token");
        router.push("/auth/signin");
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/signin");
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // View Course Details
  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  // Approve Course
  const handleApproveCourse = async (courseId: string, courseName: string) => {
    try {
      const response = await fetch("/dashboard/admin/api/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: courseId,
          status: "approved",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to approve course");
      }

      // Refresh the courses list to get the updated data
      await fetchCourses();
      showToast(`Course "${courseName}" approved successfully!`, "success");
    } catch (error) {
      console.error("Error approving course:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to approve course. Please try again.",
        "error"
      );
    }
  };

  // Reject Course
  const handleRejectCourse = async (courseId: string, courseName: string) => {
    try {
      const response = await fetch("/dashboard/admin/api/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: courseId,
          status: "rejected",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reject course");
      }

      // Refresh the courses list to get the updated data
      await fetchCourses();
      showToast(`Course "${courseName}" rejected successfully!`, "success");
    } catch (error) {
      console.error("Error rejecting course:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to reject course. Please try again.",
        "error"
      );
    }
  };

  // Delete Course
  const handleDeleteCourse = (courseId: string, courseName: string) => {
    setDeleteConfirm({ id: courseId, name: courseName });
  };

  const confirmDeleteCourse = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/dashboard/admin/api/courses?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete course");
      }

      // Refresh the courses list to get the updated data
      await fetchCourses();
      showToast("Course deleted successfully!", "success");
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to delete course. Please try again.",
        "error"
      );
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

      {/* Course Details Modal */}
      <CourseDetailsModal 
        course={selectedCourse} 
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCourse(null);
        }} 
      />

      {/* Delete Modal */}
      <DeleteModal 
        confirm={confirmDeleteCourse} 
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-indigo-900 to-indigo-950 border-r border-indigo-800/50 shadow-2xl relative px-6 pb-4">
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>

          <div className="flex h-16 shrink-0 items-center relative z-10">
            <h1 className="text-2xl font-bold text-white tracking-tight">LearnAI Hub</h1>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-medium border border-indigo-400/20">
              Admin
            </span>
          </div>
          <nav className="flex flex-1 flex-col relative z-10">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-2">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => router.push(item.href)}
                        className={`flex items-center w-full p-3 rounded-xl transition-all duration-300 group ${
                          item.current 
                            ? 'bg-indigo-600/40 text-white shadow-inner border border-indigo-500/30' 
                            : 'text-indigo-200 hover:bg-indigo-800/30 hover:text-white hover:-translate-y-0.5'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3 text-indigo-400 group-hover:text-indigo-300" />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              
              <li className="mt-auto space-y-4">
                {/* User Profile Widget */}
                <div className="p-4 bg-indigo-900/50 border border-indigo-800/50 rounded-2xl backdrop-blur-sm flex items-center gap-3 shadow-inner">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-indigo-400/20">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{userName}</p>
                    <p className="text-xs text-indigo-300 truncate">Administrator</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-full p-3 text-red-50 bg-red-950/30 border border-red-900/50 rounded-xl hover:bg-red-600 hover:border-red-500 transition-all duration-300 group shadow-sm hover:shadow-red-600/20"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold tracking-wide">Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 transition-all duration-300">
          <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
            <div className="flex items-center gap-x-6">
              {/* Profile Dropdown Area */}
              <div className="flex items-center gap-x-4 bg-indigo-50/50 py-1.5 px-2.5 rounded-2xl border border-indigo-100/50">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-indigo-950 pr-2">{userName}</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Course Management content */}
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
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg border border-indigo-500/20">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20" />
              <div className="relative flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Course Management</h1>
                  <p className="text-indigo-100 text-lg font-medium">Review, approve, and manage courses submitted by instructors.</p>
                </div>
                <div className="text-right">
                  <div className="text-indigo-100 text-sm mb-2 font-medium">Focus on pending approvals</div>
                  <button 
                    onClick={() => setStatusFilter("pending")}
                    className="bg-white/90 backdrop-blur-sm text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-white hover:scale-105 transition-all duration-300 flex items-center shadow-lg border border-white/20"
                  >
                    <DocumentCheckIcon className="h-5 w-5 mr-2" />
                    Review Pending Courses
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: "Total Courses", value: stats.totalCourses, icon: BookOpenIcon, color: "blue" },
                  { name: "Pending Review", value: stats.pendingCourses, icon: ClockIcon, color: "yellow" },
                  { name: "Approved", value: stats.approvedCourses, icon: CheckCircleIcon, color: "green" },
                  { name: "Rejected", value: stats.rejectedCourses, icon: XCircleIcon, color: "red" },
                  
                ].map((item) => (
                  <div key={item.name} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl bg-${item.color}-50 ring-1 ring-${item.color}-100/50 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{item.name}</p>
                        <p className="text-2xl font-extrabold text-gray-900 mt-1">{item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="relative group">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-hover:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search courses by title, description, or instructor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black placeholder-gray-400 transition-all bg-gray-50/50 focus:bg-white hover:border-gray-300"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black transition-all bg-gray-50/50 focus:bg-white hover:border-gray-300 cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    
                  </select>
                </div>
              </div>
            </div>

            {/* Courses View Wrapper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Courses <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">{filteredCourses.length}</span></h3>
                <div className="flex bg-gray-200/50 rounded-xl p-1 gap-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white shadow-sm text-indigo-600 ring-1 ring-gray-200" : "text-gray-500 hover:text-indigo-600 hover:bg-gray-100/50"}`}
                    title="Grid View"
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "table" ? "bg-white shadow-sm text-indigo-600 ring-1 ring-gray-200" : "text-gray-500 hover:text-indigo-600 hover:bg-gray-100/50"}`}
                    title="List View"
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-0">
                {currentCourses.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpenIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">No courses found</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                ) : viewMode === "table" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quizzes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentCourses.map((course) => (
                          <tr key={course._id} className="hover:bg-indigo-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <BookOpenIcon className="h-5 w-5 text-blue-600" />
                                </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                                <div className="text-xs text-gray-400 mt-1">{course.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{course.instructor.name}</div>
                            <div className="text-sm text-gray-500">{course.instructor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </span>
                          </td>
                   
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <div className="flex items-center justify-center">
    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
      course.quizzes && course.quizzes.length > 0 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-600'
    }`}>
      <span className="text-xs font-semibold">
        {course.quizzes ? course.quizzes.length : 0}
      </span>
    </div>
    <span className="ml-2 text-xs">
      {course.quizzes && course.quizzes.length > 0 ? 'questions' : 'no quiz'}
    </span>
  </div>
</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
{(course.studentsEnrolled || 0).toLocaleString()}                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {/* View Details Button */}
                              <button 
                                onClick={() => handleViewDetails(course)} 
                                className="text-blue-600 hover:text-blue-900 transition-colors" 
                                title="View Course Details"
                              >
                                <InformationCircleIcon className="h-5 w-5" />
                              </button>

                              {/* Approve/Reject Buttons (only for pending courses) */}
                              {course.status === "pending" && (
                                <>
                                  <button 
                                    onClick={() => handleApproveCourse(course._id, course.title)} 
                                    className="text-green-600 hover:text-green-900 transition-colors" 
                                    title="Approve Course"
                                  >
                                    <CheckBadgeIcon className="h-5 w-5" />
                                  </button>
                                  <button 
                                    onClick={() => handleRejectCourse(course._id, course.title)} 
                                    className="text-red-600 hover:text-red-900 transition-colors" 
                                    title="Reject Course"
                                  >
                                    <XCircleIcon className="h-5 w-5" />
                                  </button>
                                </>
                              )}
                              
                              {/* Delete Button */}
                              <button 
                                onClick={() => handleDeleteCourse(course._id, course.title)} 
                                className="text-red-600 hover:text-red-900 transition-colors" 
                                title="Delete Course"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCourses.map((course) => (
                    <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                      {course.thumbnail ? (
                        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
                          <img
                            src={course.thumbnail}
                            alt={`${course.title} thumbnail`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100 flex items-center justify-center">
                          <BookOpenIcon className="h-10 w-10 text-indigo-400" />
                        </div>
                      )}
                      <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpenIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={course.title}>
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2 min-h-[40px]">
                          {course.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-gray-400 w-20">Instructor:</span>
                            <span className="font-medium truncate" title={course.instructor.name}>{course.instructor.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-gray-400 w-20">Category:</span>
                            <span className="truncate">{course.category}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="text-gray-400 w-20">Students:</span>
                            <span className="font-medium flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {(course.studentsEnrolled || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                          {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                        </span>
                        
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleViewDetails(course)} 
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                            title="View Course Details"
                          >
                            <InformationCircleIcon className="h-5 w-5" />
                          </button>

                          {course.status === "pending" && (
                            <>
                              <button 
                                onClick={() => handleApproveCourse(course._id, course.title)} 
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors" 
                                title="Approve Course"
                              >
                                <CheckBadgeIcon className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => handleRejectCourse(course._id, course.title)} 
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                title="Reject Course"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteCourse(course._id, course.title)} 
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                            title="Delete Course"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstCourse + 1}</span> to{" "}
                      <span className="font-medium">{Math.min(indexOfLastCourse, filteredCourses.length)}</span> of{" "}
                      <span className="font-medium">{filteredCourses.length}</span> courses
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}