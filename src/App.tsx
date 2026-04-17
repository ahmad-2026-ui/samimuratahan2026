import { useState } from 'react';
import { useStore } from './store/useStore';
import { Login } from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Debts from './components/Debts';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import { Users } from './components/Users';
import Settings from './components/Settings';

function App() {
  const currentUser = useStore((state) => state.currentUser);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <Products />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'customers':
        return <Customers />;
      case 'debts':
        return <Debts />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
