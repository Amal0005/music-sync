import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import JoinRoomPage from './pages/JoinRoomPage';
import RoomPage from './pages/RoomPage';
import FirebaseSetupBanner from './components/FirebaseSetupBanner';
import { firebaseReady } from './firebase';

export default function App() {
  // Show a clear setup screen instead of crashing when Firebase isn't configured
  if (!firebaseReady) {
    return <FirebaseSetupBanner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/room/:roomCode" element={<RoomPage />} />
      </Routes>
    </BrowserRouter>
  );
}
