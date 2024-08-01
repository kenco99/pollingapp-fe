import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPollData } from '../api';

const PollPage = () => {
    const dispatch = useDispatch();
    const { question, answer } = useSelector((state) => state.socket);
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeLeft, setTimeLeft] = useState(120);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPollData = async () => {
            try {
                const tabID = sessionStorage.getItem('tabID');
                if (!tabID) {
                    throw new Error('tabID not found in sessionStorage');
                }
                const data = await getPollData(tabID);

                if(!!data?.question){
                    dispatch({ type: 'set-poll', payload: data });
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch poll data: ' + err.message);
                setLoading(false);
            }
        };

        fetchPollData();
    }, [dispatch]);

    useEffect(() => {
        if (question) {
            setSelectedOption(null);
            updateTimeLeft();
        }
    }, [question]);

    const updateTimeLeft = () => {
        if (!!question && question?.start_time) {
            const elapsedTime = Math.floor((Date.now() - new Date(question.start_time).getTime()) / 1000);
            const newTimeLeft = Math.max(120 - elapsedTime, 0);
            setTimeLeft(newTimeLeft);
        }
    };

    useEffect(() => {
        if (question && !answer && timeLeft > 0) {
            const timer = setInterval(() => {
                updateTimeLeft();
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [question, answer, timeLeft]);

    const handleSubmit = () => {
        if (selectedOption) {
            dispatch({
                type: 'answer-poll',
                payload: {
                    poll_question_id: question.id,
                    poll_option_id: selectedOption,
                    time_left: timeLeft,
                },
            });
        }
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

    if (!question || timeLeft <= 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl">Waiting for teacher to ask question...</p>
            </div>
        );
    }

    if (question && !answer && timeLeft > 0) {
        return (
            <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Select correct option and submit</h2>
                    <div className="text-sm">{timeLeft} seconds remaining</div>
                </div>
                <p className="mb-4">{question.question_text}</p>
                <div className="space-y-2">
                    {question.options_db.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="option"
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={() => setSelectedOption(option.id)}
                                className="form-radio"
                            />
                            <span>{option.option_text}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleSubmit}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Submit
                </button>
            </div>
        );
    }

    if (question && answer) {
        const totalVotes = question.options_db.reduce((sum, option) => sum + option.count, 0);
        return (
            <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">Polling results</h2>
                <div className="space-y-2">
                    {question.options_db.map((option) => (
                        <div key={option.id} className="flex items-center">
                            <span className={`w-1/4 ${option.is_correct ? 'font-bold text-green-600' : ''} ${option.id === answer.current_answer ? 'underline' : ''}`}>
                                {option.option_text}
                                {option.is_correct && ' ✓'}
                                {option.id === answer.current_answer && ' (Your answer)'}
                            </span>
                            <div className="w-3/4 bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full ${option.is_correct ? 'bg-green-500' : 'bg-blue-500'}`}
                                    style={{ width: `${calculatePercentage(option.count, totalVotes)}%` }}
                                ></div>
                            </div>
                            <span className="ml-2">{calculatePercentage(option.count, totalVotes)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

export default PollPage;
