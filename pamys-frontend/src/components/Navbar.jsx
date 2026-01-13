import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDrumstickBite, faTools, faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import logoImg from '../assets/logo.png'; // Ajuste de ruta

const Navbar = ({ seccion, setSeccion, isAdmin, cartCount, setIsCartOpen }) => {
  return (
    <header className="header-bar">
      <div className="header-content">
          <img src={logoImg} alt="Pamy's Logo" className="logo-img" onClick={() => setSeccion('inicio')} />
          <nav className="main-nav">
              <button className={seccion==='inicio'?'active':''} onClick={() => setSeccion('inicio')}><FontAwesomeIcon icon={faHome} /> <span className="nav-text">Inicio</span></button>
              <button className={seccion==='menu'?'active':''} onClick={() => setSeccion('menu')}><FontAwesomeIcon icon={faDrumstickBite} /> <span className="nav-text">Menú</span></button>
              {isAdmin ? 
                  <button className={seccion==='admin'?'active':''} onClick={() => setSeccion('admin')}><FontAwesomeIcon icon={faTools} /> <span className="nav-text">Admin</span></button> : 
                  <button className={seccion==='login'?'active':''} onClick={() => setSeccion('login')}><FontAwesomeIcon icon={faUser} /> <span className="nav-text">Mi Cuenta</span></button>
              }
              <button onClick={() => setIsCartOpen(true)} className="btn-cart">
                  <FontAwesomeIcon icon={faShoppingBag} /> <span>{cartCount}</span>
              </button>
          </nav>
      </div>
    </header>
  );
};

export default Navbar;