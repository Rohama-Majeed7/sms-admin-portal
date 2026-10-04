import type { School } from "../../types/school";
import api from "../api";
export const createSchool = async (schoolData: any) => {
  const response = await api.post("school", schoolData);
  console.log("School created successfully:", response);
  return response.data;
};

export const updateSchool = async (schoolId: number, schoolData: School) => {
  const response = await api.patch(`school/${schoolId}`, schoolData);
  return response.data;
};
export const getSchoolById = async (schoolId: number) => {
  const response = await api.get(`school/${schoolId}`);
  return response.data;
};
export const getSchoolTeachers = async (schoolId: number, params: any) => {
  const response = await api.get(`school/${schoolId}/teachers`, { params });
  return response.data;
};
export const getSchoolStudents = async (schoolId: number, params: any) => {
  const response = await api.get(`school/${schoolId}/students`, { params });
  return response.data;
};

export const getSchoolTeacher = async (schoolId: number, teacherId: number) => {
  const response = await api.get(`school/teachers/${teacherId}`, {
    params: {
      schoolId: schoolId,
    },
  });
  return response.data;
};
export const getSchoolStudent = async (schoolId: number, studentId: number) => {
  const response = await api.get(`school/students/${studentId}`, {
    params: {
      schoolId: schoolId,
    },
  });
  return response.data;
};

export const deleteSchoolTeacher = async (schoolId: number, teacherId: number) => {
  const response = await api.delete(`school/teachers/${teacherId}`, {
    params: { schoolId: schoolId },
  });
  return response.data;
}
export const deleteSchoolStudent = async (schoolId: number, studentId: number) => {
  const response = await api.delete(`school/students/${studentId}`, {
    params: { schoolId: schoolId },
  });
  return response.data;
}
export const addSchoolTeacher = async (teacherData: any) => {
  const response = await api.post(`school/teachers`, teacherData);
  return response.data;
}
export const addSchoolStudent = async (studentData: any) => {
  const response = await api.post(`school/students`, studentData);
  return response.data;
}