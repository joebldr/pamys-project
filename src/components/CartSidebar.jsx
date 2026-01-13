import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; 
import { faCheck, faTimes, faUser, faMapMarkerAlt, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'; 

const CartSidebar = ({ 
  isOpen, setIsOpen, carrito, setCarrito, 
  inputCupon, setInputCupon, aplicarCupon, 
  cuponAplicado, calcularSubtotal, calcularDescuento 
}) => {
  
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo"); // Valor por defecto

  const borrarDelCarrito = (index) => {
    const newCart = [...carrito];
    newCart.splice(index, 1);
    setCarrito(newCart);
  };

  // --- FUNCIÓN PRINCIPAL DE ENVÍO ---
  const enviarPedido = async () => {
    // 1. Validaciones
    if (carrito.length === 0) return alert("El carrito está vacío.");
    if (!nombre.trim()) return alert("Por favor escribe tu nombre.");
    if (!direccion.trim()) return alert("Por favor escribe tu dirección de entrega.");

    const total = (calcularSubtotal() - calcularDescuento()).toFixed(2);

    // 2. Preparar datos para Trello
    // (Concatenamos los datos en el campo "cliente" para que Trello lo reciba todo sin cambiar el servidor)
    const datosClienteCompleto = `${nombre} | 📍 ${direccion} | 💳 ${metodoPago}`;

    try {
      fetch('/api/order/trello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente: datosClienteCompleto, carrito, total })
      });
    } catch (error) {
      console.error("Error enviando a Trello", error);
    }

    // 3. Preparar mensaje de WhatsApp (Bien formateado)
    let mensaje = `● Hola Pamy's! Soy *${nombre}*.\n`;
    mensaje += `● *Dirección:* ${direccion}\n`;
    mensaje += `● *Pago:* ${metodoPago}\n`;
    mensaje += `--------------------------------\n`;
    mensaje += `■ *Mi Pedido:*\n`;
    
    carrito.forEach(p => {
        mensaje += `⦿ 1x ${p.nombre} - $${p.precio}\n`;
    });
    
    if (cuponAplicado) mensaje += `\n🎟 Cupón: ${cuponAplicado.codigo}`;
    mensaje += `\n● *TOTAL A PAGAR: $${total}*`;
    
    // Si eligió transferencia, agregamos una nota extra
    if (metodoPago === 'Transferencia') {
        mensaje += `\n\n(Quedo en espera de los datos bancarios para transferir)`;
    }

    // 4. Abrir WhatsApp y limpiar
    const url = `https://wa.me/526771050056?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    // Resetear formulario
    setCarrito([]);
    setNombre("");
    setDireccion("");
    setMetodoPago("Efectivo");
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
        {/* CUPONES */}
        <div className="coupon-input-group">
          <input placeholder="CÓDIGO CUPÓN" value={inputCupon} onChange={e => setInputCupon(e.target.value)} />
          <button onClick={aplicarCupon}><FontAwesomeIcon icon={faCheck} /></button>
        </div>
        {cuponAplicado && <div style={{color:'green', marginBottom:'5px', textAlign:'right'}}>Desc: -${calcularDescuento().toFixed(2)}</div>}
        <div className="total">Total: ${(calcularSubtotal() - calcularDescuento()).toFixed(2)}</div>
        
        {/* --- FORMULARIO DE DATOS --- */}
        <div style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'15px'}}>
            
            {/* Input Nombre */}
            <div style={estiloInput}>
                <FontAwesomeIcon icon={faUser} style={{color:'#888', width:'20px'}}/>
                <input 
                    type="text" 
                    placeholder="Tu Nombre" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    style={estiloCampo}
                />
            </div>

            {/* Input Dirección */}
            <div style={estiloInput}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{color:'#888', width:'20px'}}/>
                <input 
                    type="text" 
                    placeholder="Dirección / Calle y Número" 
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    style={estiloCampo}
                />
            </div>

            {/* Selección de Pago */}
            <div style={estiloInput}>
                <FontAwesomeIcon icon={faMoneyBillWave} style={{color:'#888', width:'20px'}}/>
                <select 
                    value={metodoPago} 
                    onChange={(e) => setMetodoPago(e.target.value)}
                    style={{...estiloCampo, background:'white', cursor:'pointer'}}
                >
                    <option value="Efectivo">Pago en Efectivo</option>
                    <option value="Transferencia">Pago con Transferencia</option>
                </select>
            </div>

        </div>

        {/* BOTÓN FINAL */}
        <button className="btn-whatsapp" onClick={enviarPedido}>
            <FontAwesomeIcon icon={faWhatsapp} /> Enviar Pedido
        </button>
      </div>
    </div>
  );
};

// Estilos rápidos en línea para mantener el código limpio y sin CSS extra
const estiloInput = {
    display:'flex', 
    alignItems:'center', 
    background:'white', 
    padding:'8px 10px', 
    borderRadius:'8px', 
    border:'1px solid #ddd'
};

const estiloCampo = {
    border:'none', 
    outline:'none', 
    width:'100%', 
    marginLeft:'10px', 
    fontSize:'0.95rem',
    fontFamily: 'inherit'
};

export default CartSidebar;