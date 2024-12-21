import './App.css';
import { ToastContainer } from 'react-toastify';
import Dashboard from './pages/Dashboard/Dashboard';

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
      <Dashboard/>
    </>

  );
}

export default App;
