import './App.css';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard/Dashboard';
import backgroundVideo from './assets/background.mp4';


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

      <video src={backgroundVideo} className="video-bg"
        autoPlay
        loop
        muted
        playsInline>
     </video>
      <div className='background'>

        <Dashboard />
      </div>
    </>

  );
}

export default App;
