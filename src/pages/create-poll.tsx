import React, { useState } from 'react';
import { PlusCircle, Trash2, Clock, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {useRouter} from 'next/router';
import ChatPopup from './components/chatPopup';

interface Option {
    text: string;
    isCorrect: boolean;
}

const CreatePoll: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<Option[]>([{ text: '', isCorrect: false }]);
    const [error, setError] = useState<string | null>(null);
    const { user_type, isTeacherOnline } = useAppSelector((state) => state.socket);
    const [maximumTime, setMaximumTime] = useState<string>('');

    const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setQuestion(e.target.value);
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = [...options];
        newOptions[index].text = text;
        setOptions(newOptions);
    };

    const handleCorrectChange = (index: number, isCorrect: boolean) => {
        const newOptions = options.map((option, idx) => ({
            ...option,
            isCorrect: idx === index ? isCorrect : false,
        }));
        setOptions(newOptions);
    };

    const handleMaximumTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMaximumTime(e.target.value);
    };

    const addOption = () => {
        setOptions([...options, { text: '', isCorrect: false }]);
    };

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, idx) => idx !== index));
    };

    const handleSubmit = () => {
        if (question.trim() === '') {
            setError('Please enter a question.');
            return;
        }

        if (options.some(option => option.text.trim() === '')) {
            setError('Please fill in all options before submitting.');
            return;
        }

        const pollData = {
            question,
            options,
            maximum_time: maximumTime ? Number(maximumTime) : 60
        };

        dispatch({ type: 'create-poll', payload: pollData})
        setError(null);
        router.push('/view-poll');
    };

    if (user_type === 'student') {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl">You do not have access to create a question</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create a Poll</h1>
            <div className="space-y-4">
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                        Question
                    </label>
                    <textarea
                        id="question"
                        value={question}
                        onChange={handleQuestionChange}
                        placeholder="Enter your question..."
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        rows={3}
                    />
                </div>
                {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={() => handleCorrectChange(index, !option.isCorrect)}
                                className="form-checkbox h-5 w-5 text-blue-600 transition duration-150 ease-in-out"
                            />
                            <span className="text-sm text-gray-700">Correct</span>
                        </label>
                        <button
                            onClick={() => removeOption(index)}
                            className="p-2 text-red-600 hover:text-red-800 transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    onClick={addOption}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition"
                >
                    <PlusCircle size={18} />
                    <span>Add another option</span>
                </button>
                <div className="flex items-center space-x-2">
                    <Clock size={18} className="text-gray-600" />
                    <input
                        type="number"
                        value={maximumTime}
                        onChange={handleMaximumTimeChange}
                        placeholder="Time (seconds)"
                        className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <div className="flex justify-between pt-4">
                    <button
                        onClick={goToDashboard}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center space-x-2"
                    >
                        <span>Dashboard</span>
                        <ArrowRight size={18} />
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition flex items-center space-x-2"
                    >
                        <span>Ask question</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
            <ChatPopup />
        </div>
    );
};

export default CreatePoll;
