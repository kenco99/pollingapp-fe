import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getPollData } from '../api';
import ChatPopup from './components/chatPopup';

const ViewPoll = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { question, user_type, user_id, usersOnline, pollCount } = useSelector((state) => state.socket);
    const [timeLeft, setTimeLeft] = useState(60);
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
            if (!question) {
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
            setLoading(false);
        }
    };

    const updateTimeLeft = () => {
        if (question && question.start_time) {
            const elapsedTime = Math.floor((Date.now() - new Date(question.start_time).getTime()) / 1000);
            const newTimeLeft = Math.max(question.maximum_time - elapsedTime, 0);
            setTimeLeft(newTimeLeft);
        }
    };

    const handleAskAnotherQuestion = () => {
        dispatch({type:'reset-poll'})
        router.push('/create-poll');
    };

    const handleKickStudent = (socketId) => {
        dispatch({ type: 'kick-student', payload: socketId });
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
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                {question ? (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Current Question</h2>
                        <p className="text-lg mb-6">{question.question_text}</p>
                        <div className="space-y-4 mb-6">
                            {question.options_db.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => dispatch({ type: 'answer-poll', payload: { poll_question_id: question.id, poll_option_id: option.id } })}
                                    className="w-full p-2 bg-blue-100 hover:bg-blue-200 rounded"
                                    disabled={timeLeft === 0}
                                >
                                    {option.option_text}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm font-medium text-blue-600">{timeLeft} seconds remaining</div>
                    </>
                ) : (
                    <p className="text-xl">Waiting for the teacher to start a new question...</p>
                )}
                <ChatPopup />
            </div>
        );
    }

    const totalVotes = question ? question.options_db.reduce((sum, option) => sum + option.count, 0) : 0;
    const studentsCount = usersOnline.filter(user => user.uuid !== user_id).length;

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Teacher Dashboard</h2>
                <div className="text-sm font-medium text-blue-600">
                    {question ? `${timeLeft} seconds remaining` : 'No active question'}
                </div>
            </div>

            {question ? (
                <>
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
                    <div className="mb-6">
                        <p>Total votes: {totalVotes}</p>
                        <p>Students answered: {pollCount} / {studentsCount}</p>
                    </div>
                </>
            ) : (
                <p className="text-xl mb-6">No active question. Start a new poll to begin.</p>
            )}

            <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Connected Students</h3>
                <ul className="space-y-2">
                    {usersOnline.filter(user => user.uuid !== user_id).map((student) => (
                        <li key={student.uuid} className="flex justify-between items-center">
                            <span>{student.name || 'Anonymous'}</span>
                            <button
                                onClick={() => handleKickStudent(student.socket_id)}
                                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Kick
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="text-right">
                <button
                    onClick={handleAskAnotherQuestion}
                    className={`px-4 py-2 ${pollCount === studentsCount ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'} text-white rounded`}
                    disabled={pollCount !== studentsCount}
                >
                    {question ? 'Ask Another Question' : 'Start New Poll'}
                </button>
            </div>
            <ChatPopup />
        </div>
    );
};

export default ViewPoll;
