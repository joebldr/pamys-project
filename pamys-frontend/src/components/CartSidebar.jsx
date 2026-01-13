import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'; // Corregido: faCheck y faTimes aquí

const CartSidebar = ({ 
  isOpen, setIsOpen, carrito, setCarrito, 
  inputCupon, setInputCupon, aplicarCupon, 
  cuponAplicado, calcularSubtotal, calcularDescuento 
}) => {
  
  const borrarDelCarrito = (index) => {
    const newCart = [...carrito];
    newCart.splice(index, 1);
    setCarrito(newCart);
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
          <h3>Tu Pedido</h3>
          {/* Usamos un botón simple o icono X para cerrar */}
          <button onClick={() => setIsOpen(false)} style={{fontSize:'1.5rem'}}>×</button>
      </div>
      <div className="cart-items">
        {carrito.length === 0 ? <p style={{textAlign:'center', marginTop:'20px'}}>Carrito vacío</p> : 
         carrito.map((p, i) => ( 
           <div key={i} className="cart-item-row">
               <div>
                  <strong>{p.nombre}</strong>
                  <div style={{fontSize:'0.8rem', color:'#777'}}>{p.desc?.substring(0, 20)}...</div>
               </div>
               <span>${p.precio}</span>
               <button onClick={() => borrarDelCarrito(i)} style={{color:'red', border:'none', background:'none', marginLeft:'10px', fontSize:'1.2rem', cursor:'pointer'}}>×</button>
           </div> 
         ))}
      </div>
      <div className="cart-footer">
        <div className="coupon-input-group">
          <input placeholder="CÓDIGO" value={inputCupon} onChange={e => setInputCupon(e.target.value)} />
          <button onClick={aplicarCupon}><FontAwesomeIcon icon={faCheck} /></button>
        </div>
        {cuponAplicado && <div style={{color:'green', marginBottom:'5px'}}>Descuento: -${calcularDescuento().toFixed(2)}</div>}
        <div className="total">Total: ${(calcularSubtotal() - calcularDescuento()).toFixed(2)}</div>
        <button className="btn-whatsapp"><FontAwesomeIcon icon={faWhatsapp} /> Enviar Pedido por WhatsApp</button>
      </div>
    </div>
  );
};

export default CartSidebar;