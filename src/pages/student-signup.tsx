import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../hooks/reduxHooks';
import {useDispatch} from "react-redux";

const StudentSignupPage: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { socket, user_name } = useAppSelector((state) => state.socket);

    useEffect(() => {
        if(!!user_name) router.push('/poll');
    }, [user_name]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setIsLoading(true);
            setError(null);
            try {
                const tabID = sessionStorage.getItem('tabID');
                if (!tabID) {
                    throw new Error('TabID not found in sessionStorage');
                }

                dispatch({type:'save-student-name', payload:name})
                if (socket) {
                    socket.emit('is_student', { name, tabId: tabID });
                }
                router.push('/poll');
            } catch (err) {
                setError('Failed to update user name. Please try again.');
                console.error('Error updating user name:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Enter your name</h1>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded mb-4"
                    placeholder="Enter your name..."
                    disabled={isLoading}
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Continue'}
                </button>
            </form>
        </div>
    );
};

export default StudentSignupPage;
