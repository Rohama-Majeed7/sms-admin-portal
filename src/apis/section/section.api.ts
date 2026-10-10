import { api } from "../api";

export interface AssignStudentToSectionParams {
  studentId: number | string;
  sectionId: number | string;
}

/**
 * Assigns a student to a section.
 * Endpoint: POST /section/add/student?studentId=...&sectionId=...
 */
export const addStudentToSection = async (
  studentId: number | string,
  sectionId: number | string
) => {
  const response = await api.patch(
    "/section/add/student",
    {
      sectionId,
    },
    { params: { studentId } }
  );
  return response.data;
};

export const removeStudentSection = async (
  studentId: number | string,
) => {
  const response = await api.patch(
    `/section/remove/student/${studentId}`,
  );
  return response.data;
};

export const assignStudentToSection = addStudentToSection;

export default {
  addStudentToSection,
  assignStudentToSection,
};
