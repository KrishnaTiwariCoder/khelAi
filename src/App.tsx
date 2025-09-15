import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { LandingPage } from './components/LandingPage';
import { TestInterface } from './components/TestInterface';
import { RestScreen } from './components/RestScreen';
import { ResultsDashboard } from './components/ResultsDashboard';
import { TestResult } from './types';
import { ClerkProvider } from './components/ClerkProvider';

type AppState = 'landing' | 'plank' | 'rest-pushups' | 'pushups' | 'rest-situps' | 'situps' | 'results';

function AppContent() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [results, setResults] = useState<TestResult[]>([]);
  const { isSignedIn } = useUser();

  const handleStartTest = () => {
    setCurrentState('plank');
    setResults([]);
  };

  const handleTestComplete = (testType: 'plank' | 'pushups' | 'situps', result: any) => {
    const testResult: TestResult = {
      type: testType,
      duration: result.duration,
      reps: result.reps,
      validReps: result.validReps,
      completedAt: new Date()
    };
    
    setResults(prev => [...prev, testResult]);
    
    // Navigate to next state
    switch (testType) {
      case 'plank':
        setCurrentState('rest-pushups');
        break;
      case 'pushups':
        setCurrentState('rest-situps');
        break;
      case 'situps':
        setCurrentState('results');
        break;
    }
  };

  const handleRestComplete = () => {
    if (currentState === 'rest-pushups') {
      setCurrentState('pushups');
    } else if (currentState === 'rest-situps') {
      setCurrentState('situps');
    }
  };

  const handleSaveResults = () => {
    if (isSignedIn) {
      // Save to user profile
      console.log('Saving results:', results);
      alert('Results saved to your profile!');
    } else {
      // Redirect to sign in
      console.log('Redirecting to sign in...');
      alert('Please sign in to save your results!');
    }
  };

  const handleShareResults = () => {
    if (isSignedIn) {
      // Share results
      console.log('Sharing results:', results);
      alert('Results shared!');
    }
  };

  const handleStartOver = () => {
    setCurrentState('landing');
    setResults([]);
  };

  const handleCancelTest = () => {
    setCurrentState('landing');
    setResults([]);
  };

  const renderCurrentView = () => {
    switch (currentState) {
      case 'landing':
        return <LandingPage onStartTest={handleStartTest} />;
      
      case 'plank':
        return (
          <TestInterface
            testType="plank"
            onTestComplete={(result) => handleTestComplete('plank', result)}
            onCancel={handleCancelTest}
          />
        );
      
      case 'rest-pushups':
        return (
          <RestScreen
            nextTest="Push-ups Test"
            onComplete={handleRestComplete}
            duration={30}
          />
        );
      
      case 'pushups':
        return (
          <TestInterface
            testType="pushups"
            onTestComplete={(result) => handleTestComplete('pushups', result)}
            onCancel={handleCancelTest}
          />
        );
      
      case 'rest-situps':
        return (
          <RestScreen
            nextTest="Sit-ups Test"
            onComplete={handleRestComplete}
            duration={30}
          />
        );
      
      case 'situps':
        return (
          <TestInterface
            testType="situps"
            onTestComplete={(result) => handleTestComplete('situps', result)}
            onCancel={handleCancelTest}
          />
        );
      
      case 'results':
        return (
          <ResultsDashboard
            results={results}
            onSaveResults={handleSaveResults}
            onShareResults={handleShareResults}
            onStartOver={handleStartOver}
            isAuthenticated={isSignedIn || false}
          />
        );
      
      default:
        return <LandingPage onStartTest={handleStartTest} />;
    }
  };

  return (
    <div className="font-sans">
      {renderCurrentView()}
    </div>
  );
}

function App() {
  return (
    <ClerkProvider>
      <AppContent />
    </ClerkProvider>
  );
}

export default App;