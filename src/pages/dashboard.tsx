import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getSubmissionsData } from '../api';

const Dashboard = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [columns, setColumns] = useState([
        'id',
        'question_text',
        'submission_count',
        'correct_count',
        'maximum_time',
        'options',
        'submissions',
        'createdAt',
    ]);

    const [optionColumns, setOptionColumns] = useState([
        'id',
        'option_text',
        'is_correct',
    ]);

    const [submissionColumns, setSubmissionColumns] = useState([
        'name',
        'option_text',
        'is_correct',
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tabID = sessionStorage.getItem('tabID');
                if (!tabID) {
                    throw new Error('No tabID found in sessionStorage');
                }
                const result = await getSubmissionsData(tabID);
                setQuestions(result.data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const DropdownContent = ({ items, columns }) => {
        const [isOpen, setIsOpen] = useState(false);

        if (!items || items.length === 0) return <span>No data</span>;

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                >
                    View {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                    <div className="absolute z-10 mt-2 w-max rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((column) => (
                                        <td key={`${index}-${column}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {String(item[column] || '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

    return (
        <div className="flex flex-col h-screen">
            <h1 className="text-2xl font-bold p-4">Teacher's Question Dashboard</h1>
            <div className="flex-grow overflow-auto">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {questions.map((question) => (
                            <tr key={question.id}>
                                {columns.map((column) => (
                                    <td key={`${question.id}-${column}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {column === 'options' ? (
                                            <DropdownContent items={question[column]} columns={optionColumns} />
                                        ) : column === 'submissions' ? (
                                            <DropdownContent items={question[column]} columns={submissionColumns} />
                                        ) : (
                                            String(question[column] || 'N/A')
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
