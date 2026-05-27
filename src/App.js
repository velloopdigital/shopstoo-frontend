import { useState, useEffect } from 'react';
import Login from './screens/Login';
import Home from './screens/Home';
import './index.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const profile = localStorage.getItem('profile');
    if (token && profile) {
      setUser(JSON.parse(profile));
    }
  }, []);

  const login = (profile, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('profile', JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profile');
    setUser(null);
    setCart([]);
    setSelectedStore(null);
  };

  const addToCart = (product, qty) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
  };

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  if (!user) return <Login onLogin={login} />;

  return (
    <Home
      user={user}
      cart={cart}
      cartCount={cartCount}
      addToCart={addToCart}
      setCart={setCart}
      selectedStore={selectedStore}
      setSelectedStore={setSelectedStore}
      logout={logout}
    />
  );
}
