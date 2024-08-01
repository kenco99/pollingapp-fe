import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { isTeacherOnlineAPI } from '../api';

const UserSelectionPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user_type, isTeacherOnline } = useAppSelector((state) => state.socket);

    const checkTeacherOnline = useCallback(async () => {
        try {
            const response = await isTeacherOnlineAPI();
            if (response && response.msg === "Success") {
                dispatch({type: 'set-teacher-status', payload: response.isTeacherOnline})
            }
        } catch (error) {
            console.error('Error checking teacher online status:', error);
        }
    }, []);

    useEffect(() => {
        checkTeacherOnline();
    }, [checkTeacherOnline]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                checkTeacherOnline();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [checkTeacherOnline]);

    const handleStudentSelection = () => {
        dispatch({ type: 'student-signup' })
        router.push('/student-signup');
    };

    const handleTeacherSelection = () => {
        if (!isTeacherOnline && user_type !== 'teacher') {
            dispatch({ type: 'teacher-signup' })
            router.push('/create-poll');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-8">Select what type of user you are ?</h1>
            <div className="flex space-x-4">
                <button
                    onClick={handleStudentSelection}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                    I am Student
                </button>
                <button
                    onClick={handleTeacherSelection}
                    className={`px-6 py-3 text-white rounded transition duration-200 ${
                        isTeacherOnline && user_type !== 'teacher'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                    }`}
                    disabled={isTeacherOnline && user_type !== 'teacher'}
                >
                    I am Teacher
                </button>
            </div>
        </div>
    );
};

export default UserSelectionPage;
