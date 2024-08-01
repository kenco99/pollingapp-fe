import React, {useEffect, useState} from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import {useRouter} from "next/router";

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
    }else{
        return (
            <div className="flex flex-col items-center p-6">
                <h1 className="text-2xl font-bold mb-4">Enter question and options</h1>
                <textarea
                    value={question}
                    onChange={handleQuestionChange}
                    placeholder="Enter..."
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    rows={4}
                />
                {options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2 w-full">
                        <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder="Option"
                            className="flex-grow p-2 border border-gray-300 rounded mr-2"
                        />
                        <input
                            type="checkbox"
                            checked={option.isCorrect}
                            onChange={() => handleCorrectChange(index, !option.isCorrect)}
                            className="mr-2"
                        />
                        <label className="mr-2">Is correct?</label>
                        <button
                            onClick={() => removeOption(index)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="flex justify-between w-full mt-4">
                    <button
                        onClick={addOption}
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Add another option +
                    </button>
                    <div className="flex items-center px-4 rounded">
                        <input
                            type="number"
                            value={maximumTime}
                            onChange={handleMaximumTimeChange}
                            placeholder="Time (seconds)"
                            className="flex-grow p-2 border border-gray-300 rounded mr-2"
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        Ask question →
                    </button>
                </div>
            </div>
        );
    }
};

export default CreatePoll;
