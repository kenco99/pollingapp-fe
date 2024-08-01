import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getPollData } from '../api';

const ViewPoll = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { question, user_type } = useSelector((state) => state.socket);
    const [timeLeft, setTimeLeft] = useState(120);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPollData();
    }, []);

    useEffect(() => {
        if (question) {
            updateTimeLeft();
        }
    }, [question]);

    useEffect(() => {
        if (question && timeLeft > 0) {
            const timer = setInterval(() => {
                updateTimeLeft();
            }, 1000);
            return () => clearInterval(timer);
        }
        if (timeLeft === 0) {
            handleAskAnotherQuestion();
        }
    }, [question, timeLeft]);

    const fetchPollData = async () => {
        try {
            if(!question){
                const tabID = sessionStorage.getItem('tabID');
                if (!tabID) {
                    throw new Error('tabID not found in sessionStorage');
                }
                const data = await getPollData(tabID);

                if (data?.question) {
                    dispatch({ type: 'set-poll', payload: data });
                }
            }

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch poll data: ' + err.message);
            setLoading(false);
        }
    };

    const updateTimeLeft = () => {
        if (question && question.start_time) {
            const elapsedTime = Math.floor((Date.now() - new Date(question.start_time).getTime()) / 1000);
            const newTimeLeft = Math.max(120 - elapsedTime, 0);
            setTimeLeft(newTimeLeft);
        }
    };

    const handleAskAnotherQuestion = () => {
        dispatch({type:'reset-poll'})
        router.push('/create-poll');
    };

    const calculatePercentage = (count, total) => {
        return total > 0 ? Math.round((count / total) * 100) : 0;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;
    }

    if (user_type === 'student') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl">You do not have access to view results</p>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-xl mb-4">No active question</p>
                <button
                    onClick={handleAskAnotherQuestion}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Ask Another Question
                </button>
            </div>
        );
    }

    const totalVotes = question.options_db.reduce((sum, option) => sum + option.count, 0);

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Current Question</h2>
                <div className="text-sm font-medium text-blue-600">{timeLeft} seconds remaining</div>
            </div>
            <p className="text-lg mb-6">{question.question_text}</p>
            <div className="space-y-4 mb-6">
                {question.options_db.map((option) => (
                    <div key={option.id} className="flex items-center">
                        <span className={`w-1/4 ${option.is_correct ? 'font-bold text-green-600' : ''}`}>
                            {option.option_text}
                            {option.is_correct && ' ✓'}
                        </span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-4 mr-2">
                            <div
                                className={`h-4 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${calculatePercentage(option.count, totalVotes)}%` }}
                            ></div>
                        </div>
                        <span className="w-1/4 text-right">
                            {option.count} votes ({calculatePercentage(option.count, totalVotes)}%)
                        </span>
                    </div>
                ))}
            </div>
            <div className="text-right">
                <p className="mb-2">Total votes: {totalVotes}</p>
                <button
                    onClick={handleAskAnotherQuestion}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Ask Another Question
                </button>
            </div>
        </div>
    );
};

export default ViewPoll;
