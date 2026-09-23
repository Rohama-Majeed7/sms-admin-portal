import type { School } from "../../types/school";
import api from "../api";
export const createSchool = async (schoolData: any) => {
    const response = await api.post('school', schoolData);
    console.log('School created successfully:', response);
    return response.data;
};

export const updateSchool = async (schoolId: number, schoolData: School) => {
    const response = await api.patch(`school/${schoolId}`, schoolData);
    return response.data;
}
export const getSchoolById = async (schoolId: number) => {
    const response = await api.get(`school/${schoolId}`);
    return response.data;
}