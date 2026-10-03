import {
  ArrowLeft,
  Edit,
  Mail,
  User,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getSchoolTeacher,
} from "../../apis/school/school.api";
import type { Teacher } from "../../types/teacher";
const TeacherDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const school = JSON.parse(localStorage.getItem("user") ?? "{}").schoolAdmin;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  useEffect(() => {
    // Fetch teacher details from API and set state
    const fetchTeacherDetails = async () => {
      try {
        // Replace with your API call to fetch teacher details
        const response = await getSchoolTeacher(school.id, Number(id));
        if (response?.success) {
          setTeacher({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role,
            isVerified: response.data.isVerified,
            employeeNumber: response.data.teacher?.employeeNumber,
            qualification: response.data.teacher?.qualification,
            specialization: response.data.teacher?.specialization,
            joiningDate: response.data.teacher?.joiningDate,
          });
        }
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      }
    };
    fetchTeacherDetails();
  }, []);
  

  const dateFormatter = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString("en-US", {
      year: "numeric",

      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/teachers")}
              className="text-indigo-600 rounded-lg p-2 hover:text-indigo-700 cusror-pointer"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Teacher Details
              </h1>

              <p className="text-sm text-gray-500">View teacher information</p>
            </div>
          </div>

          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <Edit size={17} />
            Edit Teacher
          </button>
        </div>

        {/* Profile */}
        <div className="mb-6 rounded-xl   border-indigo-200-indigo-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600">
              {teacher?.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {teacher?.name}
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {teacher?.isVerified ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Employee ID: {teacher?.employeeNumber || "N/A"}
              </p>

              <p className="text-sm text-gray-500">{teacher?.qualification}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <div className="rounded-xl   border-indigo-200-indigo-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info label="Full Name" value={teacher?.name} />
              <Info label="Email" value={teacher?.email} />
              <Info
                label="Employee ID"
                value={teacher?.employeeNumber || "N/A"}
              />
              <Info label="Qualification" value={teacher?.qualification} />
              <Info label="Specialization" value={teacher?.specialization} />
              <Info
                label="Joining Date"
                value={
                  teacher?.joiningDate && dateFormatter(teacher?.joiningDate)
                }
              />
              <Info label="Role" value={teacher?.role} />
            </div>
          </div>

          {/* Employment Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Briefcase size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Employment Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info label="Employee ID" value={teacher?.employeeNumber} />

              <Info
                label="Joining Date"
                value={
                  teacher?.joiningDate && dateFormatter(teacher?.joiningDate)
                }
              />

              <Info
                label="Status"
                value={teacher?.isVerified ? "Active" : "Inactive"}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Contact Information</h3>
            </div>

            <div className="space-y-4">
              <Info
                label="Email"
                value={teacher?.email}
                icon={<Mail size={16} />}
              />
            </div>
          </div>

          {/* Teaching Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <GraduationCap size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Teaching Information</h3>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                  Qualification
                </p>

                <p className="text-sm text-gray-800">
                  {teacher?.qualification}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <div className="flex items-center gap-2 text-sm text-gray-800">
        {icon && <span className="text-gray-400">{icon}</span>}

        <span>{value ?? "N/A"}</span>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
