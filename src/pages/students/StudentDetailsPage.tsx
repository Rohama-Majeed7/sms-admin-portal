import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSchoolStudent } from "../../apis/school/school.api";
import type { Student } from "../../types/student";

const StudentDetailPage = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const school = JSON.parse(localStorage.getItem("user") ?? "{}").schoolAdmin;
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    // Fetch student details from API and set state
    const fetchStudentDetails = async () => {
      try {
        // Replace with your API call to fetch student details
        const response = await getSchoolStudent(school.id, Number(id));
        if (response?.success) {
          setStudent({
            id: response.data.id,
            studentId: response.data.studentId,
            name: response.data.name,
            email: response.data.email,
            isVerified: response.data.isVerified,
            userId: response.data.student.userId,
            dateOfBirth: response.data.student.dateOfBirth,
            gender: response.data.student.gender,
            address: response.data.student.address,
            guardianName: response.data.student.guardianName,
            guardianPhone: response.data.student.guardianPhone,
          });
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    };
    fetchStudentDetails();
  }, []);

  const dateFormatter = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
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
              onClick={() => navigate("/students")}
              className="text-indigo-600 rounded-lg p-2 hover:text-indigo-700 cusror-pointer"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Student Details
              </h1>

              <p className="Text-sm text-gray-500">View student information</p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold   shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer">
            <Edit size={17} />
            Edit Student
          </button>
        </div>

        {/* Profile Card */}
        <div className="mb-6 rounded-xl border-indigo-200-indigo-200   border-indigo-200-indigo-200-indigo-200 bg-white p-6 shadow-sm ">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-600">
              {student?.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {student?.name ?? "N/A"}
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {student?.isVerified ? "Active" : "Inactive"}
                </span>
              </div>

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 ">
          {/* Personal Information */}
          <div className="rounded-xl   border-indigo-200-indigo-200 bg-white p-6 shadow-sm ">
            <div className="mb-5 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Info label="Full Name" value={student?.name ?? "N/A"} />

              <Info label="Gender" value={student?.gender ?? "N/A"} />

              <Info
                label="Date of Birth"
                value={student?.dateOfBirth ? dateFormatter(student?.dateOfBirth) : "N/A"}
                icon={<Calendar size={16} />}
              />


              <Info
                label="Address"
                value={student?.address ?? "N/A"}
                icon={<MapPin size={16} />}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm  ">
            <div className="mb-5 flex items-center gap-2">
              <GraduationCap size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Academic Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">




              <Info label="Status" value={student?.isVerified ? "Active" : "Inactive"} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm  ">
            <div className="mb-5 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Contact Information</h3>
            </div>

            <div className="space-y-4">
              <Info
                label="Email"
                value={student?.email ?? "N/A"}
                icon={<Mail size={16} />}
              />

              <Info
                label="Phone"
                value={student?.guardianPhone ?? "N/A"}
                icon={<Phone size={16} />}
              />

              <Info
                label="Address"
                value={student?.address ?? "N/A"}
                icon={<MapPin size={16} />}
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="rounded-xl  border-indigo-200 bg-white p-6 shadow-sm  ">
            <div className="mb-5 flex items-center gap-2">
              <User size={20} className="text-indigo-600" />

              <h3 className="text-lg font-semibold">Parent / Guardian</h3>
            </div>

            <div className="space-y-4">
              <Info label="Parent Name" value={student?.guardianName ?? "N/A"} />

              <Info
                label="Parent Phone"
                value={student?.guardianPhone ?? "N/A"}
                icon={<Phone size={16} />}
              />
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
  value: string;
  icon?: React.ReactNode;
}) => {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <div className="flex items-center gap-2 text-sm text-gray-800">
        {icon && <span className="text-gray-400">{icon}</span>}

        <span>{value}</span>
      </div>
    </div>
  );
};

export default StudentDetailPage;
