import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const URL = process.env.BE_URL || 'http://localhost:5001';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: URL,
});

interface QuestionParams {
    sessionId?: string;
    questionId?: string;
}

export const isTeacherOnlineAPI = async (): Promise<any> => {
    try {
        let url = '/pollapp/teacher-online';

        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching teacher online status:', error);
        throw error;
    }
};

export const getPollData = async (tabID: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/pollapp/question?tabID=${tabID}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching poll data:', error);
        throw error;
    }
};

export default axiosInstance;
