
import React from 'react';
import LogoIcon from './icons/LogoIcon';

const ApiKeyPrompt: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen p-6 bg-slate-50 text-slate-800 antialiased">
      <main className="flex flex-col items-center text-center max-w-2xl w-full">
        <LogoIcon className="h-20 w-20 mx-auto text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Google Gemini API Key Required</h1>
        <p className="text-slate-600 mb-8">
          To use this application, you first need to provide your Google Gemini API key.
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full text-left shadow-sm">
          <p className="text-lg font-semibold mb-3">Follow these steps:</p>
          <ol className="list-decimal list-inside space-y-4 text-slate-700">
            <li>
              In your project folder, open the file named <code className="bg-slate-100 text-red-600 font-mono py-1 px-1.5 rounded-md">env.js</code>.
            </li>
            <li>
              Find the line with <code className="bg-slate-100 text-slate-700 font-mono py-1 px-1.5 rounded-md">API_KEY</code> and replace the placeholder text with your actual API key.
              <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg mt-3 text-sm overflow-x-auto">
                <code>
                  {`window.process = {\n  env: {\n    API_KEY: "YOUR_GEMINI_API_KEY_HERE" // <-- Replace this part\n  }\n};`}
                </code>
              </pre>
            </li>
            <li>Save the <code className="bg-slate-100 text-red-600 font-mono py-1 px-1.5 rounded-md">env.js</code> file.</li>
            <li>Click the button below to reload the application.</li>
          </ol>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-8 py-3 w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Reload Application
        </button>
      </main>
      <footer className="py-6 text-center text-slate-500/80 mt-auto">
        <p className="text-xs">This check is performed locally in your browser. Your API key remains private.</p>
      </footer>
    </div>
  );
};

export default ApiKeyPrompt;
