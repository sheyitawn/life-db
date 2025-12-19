import './App.css';
import { ToastContainer } from 'react-toastify';
import backgroundVideo from './assets/background.mp4';

import { BrowserRouter, Routes, Route } from 'react-router';

import Dashboard from './pages/Dashboard/Dashboard';
import ConfigPage from './pages/Config/ConfigPage';

import { MasterProvider } from './state/MasterContext';

function App() {
  return (
    <>
      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <video
        src={backgroundVideo}
        className="video-bg"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="background">
        <MasterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/config" element={<ConfigPage />} />
            </Routes>
          </BrowserRouter>
        </MasterProvider>
      </div>
    </>
  );
}

export default App;
