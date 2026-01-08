
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import QuoteForm from './pages/QuoteForm';
import QuoteResult from './pages/QuoteResult';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import { Page, Prescription, Appointment } from './types';
import { auth } from './services/firebaseService';
import { onAuthStateChanged } from "firebase/auth";


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);

      // Si el usuario deja de estar autenticado y está en la página de administración,
      // lo enviamos de vuelta al inicio.
      if (!currentUser && currentPage === Page.ADMIN) {
        setCurrentPage(Page.HOME);
      }
    });
    return () => unsubscribe();
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    // FALLBACK: Usamos auth.currentUser directamente para evitar retardos del estado de React
    const activeUser = user || auth.currentUser;

    // Protección de ruta: Si intenta ir al ADMIN sin estar logueado, va al LOGIN
    if (page === Page.ADMIN && !activeUser) {
      setCurrentPage(Page.LOGIN);
    } else {
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuoteSubmit = (data: Prescription) => {
    setCurrentPrescription(data);
    handleNavigate(Page.RESULT);
  };

  const handleBookingSubmit = (data: Appointment) => {
    setCurrentAppointment(data);
    handleNavigate(Page.CONFIRMATION);
  };

  const renderPage = () => {
    // Mientras carga la autenticación en una ruta protegida, mostramos un loader
    if (currentPage === Page.ADMIN && !authLoaded) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (currentPage) {
      case Page.HOME:
        return <Home onNavigate={handleNavigate} />;
      case Page.QUOTE:
        return <QuoteForm onSubmit={handleQuoteSubmit} />;
      case Page.RESULT:
        return <QuoteResult prescription={currentPrescription} onNavigate={handleNavigate} />;
      case Page.BOOKING:
        return <Booking onSubmit={handleBookingSubmit} />;
      case Page.CONFIRMATION:
        return <Confirmation appointment={currentAppointment} onNavigate={handleNavigate} />;
      case Page.CONTACT:
        return <Contact />;
      case Page.ABOUT:
        return <About onNavigate={handleNavigate} />;
      case Page.LOGIN:
        return <Login onLoginSuccess={() => handleNavigate(Page.ADMIN)} />;
      case Page.ADMIN:
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default App;
