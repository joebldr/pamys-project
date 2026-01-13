import React, { useState, useEffect, useRef } from 'react';
import './App.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faCopy } from '@fortawesome/free-solid-svg-icons';
import fondoLoginImg from './assets/fondologin.jpg';

// --- IMPORTACIÓN DE COMPONENTES ---
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import AdminPanel from './components/AdminPanel';

function App() {
  const [seccion, setSeccion] = useState('inicio'); 
  
  // Datos
  const [productos, setProductos] = useState([]);
  const [promociones, setPromociones] = useState([]); 
  const [cupones, setCupones] = useState([]);
  
  // Carrito
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Auth
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  // Cupones lógica
  const [inputCupon, setInputCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);

  // Formularios Admin
  const [formP, setFormP] = useState({ nombre: '', precio: '', desc: '', img: '' });
  const [formPromo, setFormPromo] = useState({ nombre: '', precio: '', desc: '', img: '' }); 
  const [formC, setFormC] = useState({ codigo: '', descuento: '', tipo: 'fijo' });

  // Referencia
  const cuponesRef = useRef(null);
  
  // URL de tu API
  const API = "https://pamys-project.onrender.com/api";

  const fetchData = async () => {
    try {
      const resP = await fetch(`${API}/products`);
      const resPromo = await fetch(`${API}/promotions`);
      const resC = await fetch(`${API}/coupons`);
      
      if(resP.ok) setProductos(await resP.json());
      if(resPromo.ok) setPromociones(await resPromo.json());
      if(resC.ok) setCupones(await resC.json());
    } catch (error) { console.error("Error conectando al servidor"); }
  };

  useEffect(() => { 
    fetchData(); 
    const role = localStorage.getItem('role');
    if (role === 'admin') setIsAdmin(true);
  }, []);

  // --- LOGICA ---
  const scrollACupones = () => cuponesRef.current?.scrollIntoView({ behavior: 'smooth' });
  const copiarCupon = (codigo) => { navigator.clipboard.writeText(codigo); alert(`¡Código ${codigo} copiado!`); };

  const calcularSubtotal = () => carrito.reduce((acc, p) => acc + Number(p.precio), 0);
  const calcularDescuento = () => {
    if (!cuponAplicado) return 0;
    const sub = calcularSubtotal();
    return cuponAplicado.tipo === 'porcentaje' ? (sub * (cuponAplicado.descuento / 100)) : cuponAplicado.descuento;
  };

  const aplicarCupon = () => {
    const found = cupones.find(c => c.codigo === inputCupon.toUpperCase());
    if (found) { setCuponAplicado(found); alert("Cupón activado"); }
    else { alert("Cupón no válido"); setCuponAplicado(null); }
  };

  const authAccion = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/${isLoginTab ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      const data = await res.json();
      
      if (res.ok) {
        if(isLoginTab) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          setIsAdmin(data.role === 'admin');
          alert("Bienvenido " + user);
          setSeccion('inicio');
          window.location.reload(); 
        } else { 
          alert("Cuenta creada con éxito. Ahora inicia sesión."); setIsLoginTab(true); 
        }
      } else { alert(data.msg || "Error en credenciales"); }
    } catch (error) { alert("Error de conexión"); }
  };

  const cerrarSesion = () => { localStorage.clear(); setIsAdmin(false); setSeccion('inicio'); window.location.reload(); };

  // --- CRUD HELPER INTELIGENTE (POST y PUT) ---
  const guardarItem = async (endpoint, data, setForm, initialForm) => {
    const token = localStorage.getItem('token');
    
    // Si data tiene _id, es una EDICIÓN (PUT), si no, es CREACIÓN (POST)
    const esEdicion = !!data._id;
    const method = esEdicion ? 'PUT' : 'POST';
    const url = esEdicion ? `${API}/${endpoint}/${data._id}` : `${API}/${endpoint}`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert(esEdicion ? "¡Actualizado con éxito!" : "¡Creado con éxito!");
            setForm(initialForm); // Limpia formulario
            fetchData(); // Recarga datos
        } else {
            alert("Error al guardar");
        }
    } catch (error) { console.error("Error:", error); }
  };

  const borrarItem = async (id, tipo) => {
    if(!window.confirm("¿Seguro de eliminar?")) return;
    await fetch(`${API}/${tipo}/${id}`, { 
      method: 'DELETE', headers: { 'Authorization': localStorage.getItem('token') }
    });
    fetchData();
  };

  return (
    <div className="App">
      <Navbar seccion={seccion} setSeccion={setSeccion} isAdmin={isAdmin} cartCount={carrito.length} setIsCartOpen={setIsCartOpen} />

      <main className="main-container" style={seccion === 'login' ? {padding: 0, maxWidth: '100%'} : {}}>
        {seccion === 'inicio' && (
          <>
            <Hero scrollFn={scrollACupones} />

            <div id="seccion-cupones" ref={cuponesRef} style={{textAlign:'center', marginBottom:'40px'}}>
                <h2 className="section-title">Nuestros Cupones</h2>
                <p className="section-subtitle">Haz clic para copiar el código</p>
                <div className="coupons-grid">
                {cupones.map(c => (
                    <div key={c._id} className="coupon-card" onClick={() => copiarCupon(c.codigo)}>
                      <div className="coupon-icon"><FontAwesomeIcon icon={faTag} /></div>
                      <div className="coupon-details">
                          <div className="code">{c.codigo}</div>
                          <div className="desc">-{c.tipo === 'porcentaje' ? `${c.descuento}%` : `$${c.descuento}`}</div>
                      </div>
                      <div className="coupon-action"><FontAwesomeIcon icon={faCopy} /></div>
                    </div>
                ))}
                {cupones.length === 0 && <p>No hay cupones activos hoy.</p>}
                </div>
            </div>

            <div className="promotions-section">
                <h2 className="section-title">Promociones y Paquetes</h2>
                <div className="products-grid">
                    {promociones.map(p => (
                    <div key={p._id} className="product-card promo-style">
                        <div className="badge-promo">Oferta</div>
                        <img src={p.img || 'https://via.placeholder.com/300'} alt={p.nombre} />
                        <div className="card-body">
                          <h3>{p.nombre}</h3>
                          <p className="desc-text">{p.desc}</p>
                          <div className="price">${p.precio}</div>
                          <button onClick={() => { setCarrito([...carrito, p]); setIsCartOpen(true); }} className="btn-add">Agregar al Carrito</button>
                        </div>
                    </div>
                    ))}
                    {promociones.length === 0 && <p style={{gridColumn:'1/-1', textAlign:'center'}}>Próximamente.</p>}
                </div>
            </div>
          </>
        )}

        {seccion === 'menu' && (
          <div className="products-grid">
            {productos.map(p => (
              <div key={p._id} className="product-card">
                <img src={p.img || 'https://via.placeholder.com/150'} alt={p.nombre} />
                <div className="card-body">
                    <h3>{p.nombre}</h3>
                    <p className="desc-text">{p.desc}</p>
                    <div className="price">${p.precio}</div>
                    <button onClick={() => { setCarrito([...carrito, p]); setIsCartOpen(true); }} className="btn-add">Agregar al Carrito</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {seccion === 'login' && (
          <div className="login-container" style={{backgroundImage: `url(${fondoLoginImg})`}}>
            <div className="login-card">
                <div className="tabs">
                  <button onClick={() => setIsLoginTab(true)} className={isLoginTab ? 'active' : ''}>Entrar</button>
                  <button onClick={() => setIsLoginTab(false)} className={!isLoginTab ? 'active' : ''}>Registrarse</button>
                </div>
                <form onSubmit={authAccion} className="auth-form">
                  <input placeholder="Usuario" onChange={e => setUser(e.target.value)} required className="form-input" />
                  <input type="password" placeholder="Contraseña" onChange={e => setPass(e.target.value)} required className="form-input" />
                  <button type="submit" className="btn-main">{isLoginTab ? 'Iniciar Sesión' : 'Crear Cuenta'}</button>
                </form>
            </div>
          </div>
        )}

        {seccion === 'admin' && isAdmin && (
          <AdminPanel 
            cerrarSesion={cerrarSesion}
            productos={productos}
            guardarProducto={(e) => { e.preventDefault(); guardarItem('products', formP, setFormP, { nombre: '', precio: '', desc: '', img: '' }); }}
            formP={formP} setFormP={setFormP}
            promociones={promociones}
            guardarPromocion={(e) => { e.preventDefault(); guardarItem('promotions', formPromo, setFormPromo, { nombre: '', precio: '', desc: '', img: '' }); }}
            formPromo={formPromo} setFormPromo={setFormPromo}
            cupones={cupones}
            guardarCupon={(e) => { e.preventDefault(); guardarItem('coupons', formC, setFormC, { codigo: '', descuento: '', tipo: 'fijo' }); }}
            formC={formC} setFormC={setFormC}
            borrarItem={borrarItem}
          />
        )}
      </main>

      <Footer />

      <CartSidebar 
        isOpen={isCartOpen} setIsOpen={setIsCartOpen}
        carrito={carrito} setCarrito={setCarrito}
        inputCupon={inputCupon} setInputCupon={setInputCupon}
        aplicarCupon={aplicarCupon} cuponAplicado={cuponAplicado}
        calcularSubtotal={calcularSubtotal} calcularDescuento={calcularDescuento}
      />
    </div>
  );
}

export default App;