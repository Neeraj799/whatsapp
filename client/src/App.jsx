import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Profilepage from "./pages/Profilepage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function App() {
  const { authUser } = useContext(AuthContext);
  return (
    <>
      <ToastContainer />
      <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
        <Routes>
          <Route
            path="/"
            element={authUser ? <Homepage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={!authUser ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={authUser ? <Profilepage /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
