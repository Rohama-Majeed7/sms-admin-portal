import type { UpdateClassPayload } from "../../types/class";
import { api } from "../api";

export interface CreateClassPayload {
    name: string;
    schoolId: number;
    sections?: Array<{
        name: string;
        classId?: number | null;
        inchargeId?: number | null;
    }>;
    subjects?: Array<{
        name: string;
    }>;
    timetables?: Array<{
        teacherId: number;
        sectionId: number | string;
        subjectId: number | string;
        day: number;
        startTime: string;
        endTime: string;
    }>;
}

export const createClass = async (
    payload: CreateClassPayload,
) => {
    const response = await api.post("/class/create", payload);
    return response.data;
};

export const updateClass = async (
    classId: number,
    payload: UpdateClassPayload
) => {
    const response = await api.patch(`/class/edit/${classId}`, payload);
    return response.data;
};

export const createSection = async (payload: { name: string, classId?: number, inchargeId?: number }) => {
    const response = await api.post("/class/create/section", payload);
    return response.data;
};

export const getClassById = async (classId: number | string, schoolId: number) => {
    const response = await api.get(`/class/${classId}`, {
        params: {
            schoolId: schoolId
        }
    });
    return response.data;
};
export const getAllClasses = async (schoolId: number) => {
    const response = await api.get(`/class`, {
        params: {
            schoolId: schoolId
        }
    });
    return response.data;
};
export const publishClass = async (classId: number) => {
    const response = await api.patch(`/class/publish/${classId}`);
    return response.data;
};
export const deleteClassSection = async (classId: number | string, sectionId: number | string) => {
    const response = await api.delete(`/class/${classId}/section/${sectionId}`);
    return response.data;
};

export const deleteClassSubject = async (classId: number | string, subjectId: number | string) => {
    const response = await api.delete(`/class/${classId}/subject/${subjectId}`);
    return response.data;
};
