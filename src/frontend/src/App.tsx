import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatBox } from './components/ChatBox';

function App() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isNewSession, setIsNewSession] = useState(true);

  const handleCreateSession = useCallback(() => {
    setCurrentSessionId(null);
    setIsNewSession(true);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsNewSession(false);
  }, []);

  const handleSessionCreated = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsNewSession(false);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <Sidebar
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatBox
          sessionId={currentSessionId}
          isNew={isNewSession}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}

export default App;
