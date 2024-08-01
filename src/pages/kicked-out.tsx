import React from 'react';
import { useRouter } from 'next/router';

const KickedOut = () => {
    const router = useRouter();

    const handleReturnHome = () => {
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">You've Been Kicked Out</h1>
            <p className="text-xl mb-8">The teacher has removed you from the session.</p>
        </div>
    );
};

export default KickedOut;
