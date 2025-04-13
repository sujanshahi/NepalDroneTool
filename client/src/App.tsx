import React from 'react';

// Ultra-simple app to make sure the preview works
function App() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Basic Test</h1>
        <p className="text-lg">If you can see this, the app is working correctly.</p>
        <div className="mt-4">
          <a href="/map" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Go to Map (may crash)
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
