'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChartBarIcon,
  BookOpenIcon,
  UserGroupIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
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
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: "draft" | "pending" | "approved" | "rejected" | "reported";
  studentsEnrolled: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  materials: CourseMaterial[];
}

interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  pendingCourses: number;
  totalStudents: number;
}

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: "draft" | "pending";
  thumbnail: string;
  materials: CourseMaterial[];
}

// CourseModal component with improved file upload
const CourseModal = ({ 
  isOpen, 
  onClose, 
  isEditMode, 
  course,
  formData,
  setFormData,
  isSubmitting,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  course?: Course | null;
  formData: CourseFormData;
  setFormData: (data: CourseFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) => {
  const [newMaterial, setNewMaterial] = useState<CourseMaterial>({
    type: 'pdf',
    url: '',
    title: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (file: File, type: 'pdf' | 'image') => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', type);

      console.log('Starting file upload:', file.name, file.type, file.size);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      clearInterval(progressInterval);

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.log('Upload error response:', errorData);
        } catch (e) {
          // If response is not JSON, get the text
          const text = await response.text();
          errorMessage = text || errorMessage;
          console.log('Upload error text:', text);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      
      setUploadProgress(100);
      
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, materialType: 'pdf' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    setUploadError(null);

    // Validate file type
    if (materialType === 'pdf' && file.type !== 'application/pdf') {
      const errorMsg = `Please select a PDF file. Selected file type: ${file.type}`;
      setUploadError(errorMsg);
      alert(errorMsg);
      return;
    }

    if (materialType === 'image' && !file.type.startsWith('image/')) {
      const errorMsg = `Please select an image file. Selected file type: ${file.type}`;
      setUploadError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      const uploadedUrl = await handleFileUpload(file, materialType);
      
      // Auto-fill the URL and title
      setNewMaterial({
        ...newMaterial,
        type: materialType,
        url: uploadedUrl,
        title: file.name.replace(/\.[^/.]+$/, "") // Remove file extension for title
      });
      
    } catch (error) {
      console.error('File upload error:', error);
      // Error is already set in handleFileUpload
      
      // Reset file input on error
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleYouTubeUrlChange = (url: string) => {
    setUploadError(null);
    
    // Extract video ID from YouTube URL for display
    let videoId = '';
    let title = 'YouTube Video';
    
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.searchParams.get('v') || urlObj.pathname.slice(1);
        if (videoId) {
          title = `YouTube: ${videoId}`;
        }
      }
    } catch (error) {
      // Invalid URL, keep original title
    }

    setNewMaterial({
      ...newMaterial,
      type: 'youtube',
      url: url,
      title: title
    });
  };

  const addMaterial = () => {
    if (newMaterial.url && newMaterial.title) {
      setFormData({
        ...formData,
        materials: [...formData.materials, newMaterial]
      });
      setNewMaterial({
        type: 'pdf',
        url: '',
        title: '',
        description: ''
      });
      setUploadError(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const removeMaterial = (index: number) => {
    const updatedMaterials = formData.materials.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      materials: updatedMaterials
    });
  };

  // Reset error when changing material type
  const handleMaterialTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewMaterial({ 
      type: e.target.value as 'pdf' | 'image' | 'youtube', 
      url: '', 
      title: '', 
      description: '' 
    });
    setUploadError(null);
  };

  if (!isOpen) return null;

  const categories = [
    "Programming",
    "Data Science",
    "Design",
    "Business",
    "Marketing",
    "Music",
    "Photography",
    "Health & Fitness"
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const materialTypes = [
    { value: 'pdf', label: 'PDF Document', icon: DocumentIcon },
    { value: 'image', label: 'Image', icon: PhotoIcon },
    { value: 'youtube', label: 'YouTube Video', icon: FilmIcon }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative z-10 w-full max-w-4xl mx-auto transform transition-all">
          <div className="relative z-10 w-full max-w-4xl mx-auto p-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl animate-slideUp text-gray-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isEditMode ? "Edit Course" : "Create New Course"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditMode ? "Update course details." : "Fill in the details to create a new course."}
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
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      placeholder="Describe what students will learn in this course"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <select
                        id="category"
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Level *
                      </label>
                      <select
                        id="level"
                        required
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      >
                        <option value="">Select a level</option>
                        {levels.map(level => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                      className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Optional: Add a thumbnail image URL for your course
                    </p>
                  </div>
                </div>

                {/* Course Materials */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 border-b pb-2">Course Materials</h4>
                  
                  {/* Upload Error Display */}
                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Upload Error:</strong> {uploadError}
                      </p>
                    </div>
                  )}
                  
                  {/* Add New Material */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <h5 className="text-sm font-medium text-gray-700">Add New Material</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={newMaterial.type}
                          onChange={handleMaterialTypeChange}
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {materialTypes.map(materialType => (
                            <option key={materialType.value} value={materialType.value}>
                              {materialType.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title *</label>
                        <input
                          type="text"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Material title"
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    {/* File Upload for PDF and Image */}
                    {(newMaterial.type === 'pdf' || newMaterial.type === 'image') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload {newMaterial.type === 'pdf' ? 'PDF File' : 'Image'} *
                        </label>
                        <div className="space-y-2">
                          <input
                            id="file-input"
                            type="file"
                            accept={newMaterial.type === 'pdf' ? '.pdf,application/pdf' : 'image/*'}
                            onChange={(e) => handleFileChange(e, newMaterial.type as 'pdf' | 'image')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={uploading}
                          />
                          {uploading && (
                            <div className="space-y-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {newMaterial.type === 'pdf' 
                              ? 'Upload a PDF file (max 10MB)' 
                              : 'Upload an image file (max 10MB)'
                            }
                          </p>
                        </div>
                      </div>
                    )}

                    {/* YouTube URL Input */}
                    {newMaterial.type === 'youtube' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">YouTube URL *</label>
                        <input
                          type="url"
                          value={newMaterial.url}
                          onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                          className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://www.youtube.com/watch?v=..."
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a YouTube video URL
                        </p>
                      </div>
                    )}

                    {/* URL Display (read-only after upload) */}
                    {newMaterial.url && (newMaterial.type === 'pdf' || newMaterial.type === 'image') && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>File ready:</strong> {newMaterial.url.split('/').pop()}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Optional description"
                        disabled={uploading}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addMaterial}
                      disabled={!newMaterial.url || !newMaterial.title || uploading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Uploading...' : 'Add Material'}
                    </button>
                  </div>

                  {/* Materials List */}
                  {formData.materials.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-700">
                        Added Materials ({formData.materials.length})
                      </h5>
                      {formData.materials.map((material, index) => {
                        const MaterialIcon = materialTypes.find(mt => mt.value === material.type)?.icon || DocumentIcon;
                        const isUploadedFile = (material.type === 'pdf' || material.type === 'image') && material.url.startsWith('/uploads/');
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3 flex-1">
                              <MaterialIcon className="h-5 w-5 text-blue-600" />
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{material.title}</div>
                                <div className="text-xs text-gray-500 flex items-center space-x-2">
                                  <span className="uppercase">{material.type}</span>
                                  <span>•</span>
                                  <span className={isUploadedFile ? "text-green-600" : "text-blue-600"}>
                                    {isUploadedFile ? "Uploaded File" : "External URL"}
                                  </span>
                                  {material.description && (
                                    <>
                                      <span>•</span>
                                      <span>{material.description}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMaterial(index)}
                              className="text-red-600 hover:text-red-800 p-1 ml-2"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "draft" | "pending" })}
                    className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/95"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="pending">Submit for Review</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.status === 'draft' 
                      ? 'Course will be saved as draft and not visible to students.'
                      : 'Course will be submitted for admin review before publication.'
                    }
                  </p>
                </div>
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
                  {isSubmitting ? "Saving..." : isEditMode ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
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

export default function InstructorCourses() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "pending" | "approved" | "rejected">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    status: "draft",
    thumbnail: "",
    materials: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const navigation = [
    { name: "Dashboard", href: "/dashboard/instructor", icon: ChartBarIcon, current: false },
    { name: "My Courses", href: "/dashboard/instructor/courses", icon: BookOpenIcon, current: true },
    { name: "Students", href: "/dashboard/instructor/students", icon: UserGroupIcon, current: false },
    { name: "Settings", href: "/dashboard/instructor/settings", icon: CogIcon, current: false },
  ];

  // Fetch courses data
  const fetchCourses = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError("No authentication token found");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/dashboard/instructor/api/courses", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        throw new Error("Failed to fetch courses data");
      }

      const data = await response.json();
      setCourses(data.courses || []);
      setStats(data.stats || {
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        pendingCourses: 0,
        totalStudents: 0
      });
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "Failed to load courses data. Please try again.");
      setCourses([]);
      setStats({
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        pendingCourses: 0,
        totalStudents: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const tokenFromUrl = searchParams.get('token');
        
        if (tokenFromUrl) {
          localStorage.setItem('token', tokenFromUrl);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }

        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/auth/signin');
          return;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role !== 'instructor') {
          router.push('/');
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
  }, [router, searchParams]);

  // Filter courses based on search and filters
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());
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

  // Add Course Functions
  const handleAddCourse = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      level: "beginner",
      status: "draft",
      thumbnail: "",
      materials: []
    });
    setShowAddModal(true);
  };

  const handleSubmitAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/dashboard/instructor/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create course");
      }

      await fetchCourses();
      setShowAddModal(false);
      setFormData({ 
        title: "", 
        description: "", 
        category: "", 
        level: "beginner", 
        status: "draft", 
        thumbnail: "",
        materials: [] 
      });

      showToast("Course created successfully!", "success");
    } catch (error) {
      console.error("Error creating course:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to create course. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Course Functions
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      status: course.status as "draft" | "pending",
      thumbnail: course.thumbnail || "",
      materials: course.materials || []
    });
    setShowEditModal(true);
  };

  const handleSubmitEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/dashboard/instructor/api/courses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: selectedCourse._id,
          ...formData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update course");
      }

      await fetchCourses();
      setShowEditModal(false);
      setSelectedCourse(null);
      setFormData({ 
        title: "", 
        description: "", 
        category: "", 
        level: "beginner", 
        status: "draft", 
        thumbnail: "",
        materials: [] 
      });

      showToast("Course updated successfully!", "success");
    } catch (error) {
      console.error("Error updating course:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to update course. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = (courseId: string, courseName: string) => {
    setDeleteConfirm({ id: courseId, name: courseName });
  };

  const confirmDeleteCourse = async () => {
    if (!deleteConfirm) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/dashboard/instructor/api/courses?id=${deleteConfirm.id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete course");
      }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "pending":
        return <ClockIcon className="h-4 w-4" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4" />;
      case "draft":
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <EyeIcon className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
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

      {/* Add/Edit Course Modals */}
      <CourseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        isEditMode={false}
        course={null}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitAddCourse}
      />
      
      <CourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        isEditMode={true}
        course={selectedCourse}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmitEditCourse}
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
              <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
                LearnAI Hub
              </h1>
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
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-2xl font-bold" style={{ color: '#667eea' }}>
              LearnAI Hub
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button 
                        onClick={() => router.push(item.href)} 
                        className={`flex items-center w-full p-3 rounded-lg transition-colors group ${item.current ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        <item.icon className={`h-5 w-5 mr-3 ${item.current ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="p-3 text-sm text-gray-600 border-t border-gray-200">
                  <div className="font-medium text-gray-900">Instructor</div>
                </div>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group mt-2"
                >
                  <XMarkIcon className="h-5 w-5 mr-3 text-red-400" />
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
              <span className="text-sm text-gray-700">Instructor</span>
              <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-700">Logout</button>
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
            <div 
              className="rounded-2xl p-8 text-white"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">My Courses</h1>
                  <p className="text-blue-100 text-lg">Manage and create courses for your students.</p>
                </div>
                <button 
                  onClick={handleAddCourse} 
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Course
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { name: "Total Courses", value: stats.totalCourses, icon: BookOpenIcon, color: "blue" },
                  { name: "Published", value: stats.publishedCourses, icon: CheckCircleIcon, color: "green" },
                  { name: "Drafts", value: stats.draftCourses, icon: EyeIcon, color: "gray" },
                  { name: "Pending", value: stats.pendingCourses, icon: ClockIcon, color: "yellow" },
                  { name: "Total Students", value: stats.totalStudents, icon: UserGroupIcon, color: "purple" },
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
                      placeholder="Search courses by title, description, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">My Courses ({filteredCourses.length})</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materials</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCourses.length > 0 ? (
                      currentCourses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpenIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {course.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {course.materials && course.materials.length > 0 ? (
                                <>
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {course.materials.length} materials
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">No materials</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {course.studentsEnrolled.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                              {getStatusIcon(course.status)}
                              <span className="ml-1">
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(course.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditCourse(course)} 
                                className="text-blue-600 hover:text-blue-900 transition-colors" 
                                title="Edit Course"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                          <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium">No courses found</p>
                          <p className="mt-1">Try adjusting your search or create your first course</p>
                          <button 
                            onClick={handleAddCourse}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Create Your First Course
                          </button>
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