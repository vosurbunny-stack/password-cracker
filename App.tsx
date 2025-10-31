import React, { useState, useCallback } from 'react';
import { AnalysisResult } from './types';
import { analyzeHash, generateHash, addHashToDb } from './services/hashService';
import { ClipboardIcon, CheckIcon, SearchIcon, HashIcon, InfoIcon } from './components/Icons';

function App() {
  // State for Analyzer
  const [hashToAnalyze, setHashToAnalyze] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for Generator
  const [passwordToGenerate, setPasswordToGenerate] = useState('');
  const [generatedHash, setGeneratedHash] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for copy-to-clipboard feedback
  const [hashCopied, setHashCopied] = useState(false);
  const [testHashCopied, setTestHashCopied] = useState(false);
  
  const testHash = 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f';

  const handleAnalyze = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await analyzeHash(hashToAnalyze);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  }, [hashToAnalyze]);

  const handleGenerate = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    const hash = await generateHash(passwordToGenerate);
    setGeneratedHash(hash);
    if (hash && passwordToGenerate) {
        addHashToDb(hash, passwordToGenerate); // Add the new hash to the DB
    }
    setIsGenerating(false);
  }, [passwordToGenerate]);
  
  const handleCopyToClipboard = useCallback((textToCopy: string, type: 'hash' | 'testHash') => {
    navigator.clipboard.writeText(textToCopy);
    if (type === 'hash') {
        setHashCopied(true);
        setTimeout(() => setHashCopied(false), 2000);
    } else {
        setTestHashCopied(true);
        setTimeout(() => setTestHashCopied(false), 2000);
    }
  }, []);

  const formatHash = (hash: string) => {
    if (hash.length > 48) {
        return (
            <>
                {hash.slice(0, 48)}
                <br/>
                {hash.slice(48)}
            </>
        )
    }
    return hash;
  }

  return (
    <div className="min-h-screen bg-dark-blue text-slate-300 font-sans p-4 md:p-8 flex flex-col items-center">
      <header className="text-center my-8 md:my-12">
        <p className="text-lg text-slate-400 max-w-2xl">
          Analyze SHA-256 hashes and generate test hashes for security research
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analyzer Card */}
        <div className="bg-card-blue border border-cyan-400/20 rounded-xl p-6 shadow-[0_0_15px_rgba(44,251,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <SearchIcon className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-100">Password Hash Analyzer</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Enter a SHA-256 hash to find the original password</p>
          <form onSubmit={handleAnalyze} className="flex gap-2">
            <input
              type="text"
              value={hashToAnalyze}
              onChange={(e) => setHashToAnalyze(e.target.value)}
              placeholder="Enter SHA-256 hash..."
              className="flex-grow bg-dark-blue border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-accent-teal/50 focus:outline-none transition duration-200 font-mono text-sm"
            />
            <button
              type="submit"
              disabled={isAnalyzing || !hashToAnalyze}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold py-2 px-5 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
              {isAnalyzing ? '...' : 'Analyze'}
            </button>
          </form>
          {(analysisResult) && (
            <div className="mt-4 bg-dark-blue/70 p-4 rounded-md border border-slate-700/50 font-mono text-xs space-y-3">
              <div>
                  <p className="text-slate-500">Input Hash:</p>
                  <p className="text-slate-300 break-all">{formatHash(analysisResult.inputHash)}</p>
              </div>
              <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                <p className="text-slate-500">Status:</p>
                {analysisResult.status === 'found' ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckIcon className="w-5 h-5" />
                    <p>Password found &rarr; <span className="text-accent-teal">{analysisResult.password}</span></p>
                  </div>
                ) : (
                    <p className="text-yellow-400 font-semibold">{analysisResult.message}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generator Card */}
        <div className="bg-card-blue border border-cyan-400/20 rounded-xl p-6 shadow-[0_0_15px_rgba(44,251,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <HashIcon className="w-6 h-6 text-slate-400" />
            <h2 className="text-xl font-bold text-slate-100">Generate Test Hash</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Enter a password to generate its SHA-256 hash</p>
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              type="text"
              value={passwordToGenerate}
              onChange={(e) => setPasswordToGenerate(e.target.value)}
              placeholder="Enter password..."
              className="flex-grow bg-dark-blue border border-slate-700 rounded-md px-3 py-2 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-accent-teal/50 focus:outline-none transition duration-200"
            />
            <button
              type="submit"
              disabled={isGenerating || !passwordToGenerate}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold py-2 px-5 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
            >
              {isGenerating ? '...' : 'Generate'}
            </button>
          </form>
          {(generatedHash) && (
            <div className="mt-4 bg-dark-blue/70 p-4 rounded-md border border-slate-700/50 font-mono text-xs space-y-3">
                <div className="relative">
                    <p className="text-slate-500">Generated SHA-256 Hash:</p>
                    <p className="text-slate-300 break-all pr-8">{formatHash(generatedHash)}</p>
                    <button 
                    onClick={() => handleCopyToClipboard(generatedHash, 'hash')}
                    className="absolute top-0 right-0 p-1 text-slate-400 hover:text-white rounded-md transition"
                    aria-label="Copy hash"
                    >
                    {hashCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <ClipboardIcon className="w-4 h-4"/>}
                    </button>
                </div>
                <div className="pt-3 border-t border-slate-700/50">
                    <p className="text-slate-500">Original Password:</p>
                    <p className="text-accent-teal font-semibold text-base">{passwordToGenerate}</p>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* How to Use Card */}
      <footer className="w-full max-w-6xl mt-6">
        <div className="bg-card-blue border border-cyan-400/20 rounded-xl p-6 shadow-[0_0_15px_rgba(44,251,255,0.1)]">
            <div className="flex items-center gap-3 mb-4">
                <InfoIcon className="w-6 h-6 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-100">How to Use</h3>
            </div>
            <ul className="list-disc list-inside text-slate-400 space-y-2 text-sm">
                <li><span className="font-semibold text-slate-300">Hash Analyzer:</span> Enter a SHA-256 hash to search for the original password in the database</li>
                <li><span className="font-semibold text-slate-300">Hash Generator:</span> Create SHA-256 hashes from passwords for testing purposes</li>
                <li className="flex items-center gap-2">
                    <span>Try this test hash:</span>
                    <button
                        onClick={() => handleCopyToClipboard(testHash, 'testHash')}
                        className="font-mono text-xs bg-dark-blue px-2 py-1 rounded-md text-accent-teal/80 hover:text-accent-teal border border-slate-700 flex items-center gap-1.5"
                    >
                        {testHash.substring(0,20)}...
                        {testHashCopied ? <CheckIcon className="w-3 h-3 text-green-400"/> : <ClipboardIcon className="w-3 h-3"/>}
                    </button>
                </li>
            </ul>
        </div>
      </footer>
    </div>
  );
}

export default App;