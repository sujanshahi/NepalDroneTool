import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Test Page</h1>
        <p className="text-lg">If you can see this, React rendering is working correctly.</p>
      </div>
    </div>
  );
};

export default TestPage;