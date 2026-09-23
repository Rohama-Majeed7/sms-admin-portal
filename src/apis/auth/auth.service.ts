import api from "../api";
import { clearSchool, saveSchool } from "../../services/schoolStorage";

export const signUp = async (fullName: string, email: string, password: string) => {
    const data = {
        name: fullName,
        email: email,
        password: password,
    };
    const response = await api.post('/auth/signup', data);
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password,portal:'admin' });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    if (response.data.user?.school) {
        saveSchool(response.data.user.school);
    }
    return response.data;
};

export const logout = async (email: string) => {
    const response = await api.post('/auth/logout', { email });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    clearSchool();
    return response.data;
};

export const sendOtp = async (email: string) => {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
};

export const resetPassword = async (email: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
};
