import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 
import { faCheck, faTimes, faUser } from '@fortawesome/free-solid-svg-icons'; 

const CartSidebar = ({ 
  isOpen, setIsOpen, carrito, setCarrito, 
  inputCupon, setInputCupon, aplicarCupon, 
  cuponAplicado, calcularSubtotal, calcularDescuento 
}) => {
  
  // Estado para guardar el nombre del cliente
  const [nombreCliente, setNombreCliente] = useState("");

  const borrarDelCarrito = (index) => {
    const newCart = [...carrito];
    newCart.splice(index, 1);
    setCarrito(newCart);
  };

  // --- FUNCIÓN PARA ENVIAR PEDIDO ---
  const enviarPedido = async () => {
    if (carrito.length === 0) return alert("El carrito está vacío.");
    if (!nombreCliente.trim()) return alert("Por favor escribe tu nombre.");

    const total = (calcularSubtotal() - calcularDescuento()).toFixed(2);

    // 1. Enviar a Trello (en segundo plano)
    try {
      fetch('/api/order/trello', { // Usamos ruta relativa
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: nombreCliente, carrito, total })
      });
    } catch (error) {
      console.error("Error enviando a Trello", error);
    }

    // 2. Armar mensaje de WhatsApp
    let mensaje = `👋 Hola Pamy's! Soy *${nombreCliente}*.\nQuiero pedir:\n\n`;
    carrito.forEach(p => {
        mensaje += `🍗 1x ${p.nombre} - $${p.precio}\n`;
    });
    
    if (cuponAplicado) mensaje += `\n🎟 Cupón: ${cuponAplicado.codigo}`;
    mensaje += `\n\n💰 *TOTAL: $${total}*`;
    mensaje += `\n📍 (Te envío mi ubicación enseguida)`;

    // 3. Abrir WhatsApp y limpiar
    const url = `https://wa.me/526771050056?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    setCarrito([]);
    setNombreCliente("");
    setIsOpen(false);
  };

  return (
    <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="cart-header">
          <h3>Tu Pedido</h3>
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
        
        {/* INPUT NOMBRE (NUEVO) */}
        <div style={{marginBottom: '10px', display:'flex', alignItems:'center', background:'white', padding:'5px', borderRadius:'5px', border:'1px solid #ddd'}}>
            <FontAwesomeIcon icon={faUser} style={{color:'#888', margin:'0 10px'}}/>
            <input 
                type="text" 
                placeholder="Tu Nombre (Requerido)" 
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                style={{border:'none', outline:'none', width:'100%'}}
            />
        </div>

        {/* BOTÓN WHATSAPP CONECTADO */}
        <button className="btn-whatsapp" onClick={enviarPedido}>
            <FontAwesomeIcon icon={faWhatsapp} /> Enviar Pedido por WhatsApp
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;