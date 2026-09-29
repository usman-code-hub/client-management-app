import React, { useState } from 'react';
import TestingForm from '../components/forms/TestingForm';
import { useEffect } from 'react';
import { getProjects } from '../services/projects';

export default function TestingPage() {
  const [saved, setSaved] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => setProjects([]));
  }, []);

  return (
    <div className="p-8 bg-[#0b0d12] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-2">Testing</h1>
      <p className="text-gray-400 mb-8">QA test cases, environment details, pass/fail tracking.</p>

      <div className="bg-[#11141b] border border-[#242833] rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold mb-6">Create Test Case</h2>
        <TestingForm projects={projects} onSuccess={() => setSaved(prev => [...prev, { id: Date.now(), time: new Date().toLocaleTimeString() }])} />
      </div>

      {saved.length > 0 && (
        <div className="mt-8 bg-[#11141b] border border-[#242833] rounded-2xl p-6">
          <h3 className="font-bold mb-4">Recent Test Runs ({saved.length})</h3>
          {saved.map(item => (
            <div key={item.id} className="text-sm text-gray-300 mb-2">• Test case saved at {item.time}</div>
          ))}
        </div>
      )}
    </div>
  );
}
