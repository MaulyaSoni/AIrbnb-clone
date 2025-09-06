import React from "react";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";
import { AuthProvider } from "./context/AuthContext";
import StripeProvider from "./components/payments/StripeProvider";
import Navbarcomponents from "./components/Navbar";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <Navbarcomponents/>
        <main className="pt-16">
          <StripeProvider>
            <AnimatedRoutes />
          </StripeProvider>
        </main>
        <Footer/>
        <BackToTop />
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
