import api from "../api";

export const signUp = async (fullName: string, email: string, password: string, schoolName: string) => {
    const data = {
        name: fullName,
        email: email,
        password: password,
        schoolName: schoolName,
    };
    try {
        const response = await api.post('/auth/signup', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
};

export const logout = async (email: string) => {
    const response = await api.post('/auth/logout', { email });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
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
