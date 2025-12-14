import { Suspense, useState, useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Home from "./pages/Home";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Router>
        <Header/>
        <Suspense fallback={<Loader isVisible={isLoading}/>}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
          <Toaster position="top-center" />
        </Suspense>
        <Footer />
      </Router>
    </>
  )
}

export default App
