// frontend/src/App.jsx
import { useState } from 'react';
import Login from './Login';
import ChatInterface from './ChatInterface'; // Assuming this is your chat file

function App() {
  const [user, setUser] = useState(null);

  // If no user is logged in, show Login Screen
  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  // If user exists, show Chat Interface and pass user details
  return (
    <div className="relative">
      {/* Logout Button (Top Right) */}
      <button 
        onClick={() => setUser(null)}
        className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded shadow"
      >
        Logout
      </button>

      {/* Pass the logged-in user to the chat */}
      <ChatInterface user={user} />
    </div>
  );
}

export default App;