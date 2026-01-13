import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faTrash, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';

const AdminPanel = ({ 
  cerrarSesion, 
  productos, guardarProducto, formP, setFormP, borrarItem,
  promociones, guardarPromocion, formPromo, setFormPromo,
  cupones, guardarCupon, formC, setFormC 
}) => {

  // Detectamos si estamos editando (si el formulario tiene un _id)
  const editandoProducto = formP._id ? true : false;
  const editandoPromo = formPromo._id ? true : false;

  // Función para limpiar el formulario de productos
  const limpiarFormP = () => {
    setFormP({ nombre: '', desc: '', precio: '', img: '' });
  };

  // Función para limpiar el formulario de promociones
  const limpiarFormPromo = () => {
    setFormPromo({ nombre: '', desc: '', precio: '', img: '' });
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
          <h2>Panel de Administración</h2>
          <button onClick={cerrarSesion} className="btn-delete">
            Cerrar Sesión <FontAwesomeIcon icon={faUser} />
          </button>
      </div>
      
      <div className="admin-layout">
        
        {/* COLUMNA 1: MENÚ (PRODUCTOS) */}
        <div className="panel-box">
          <h3>{editandoProducto ? '✏️ Editando Producto' : '➕ Agregar al Menú'}</h3>
          
          <form onSubmit={guardarProducto}>
            <input 
              placeholder="Nombre" 
              value={formP.nombre} 
              onChange={e => setFormP({...formP, nombre: e.target.value})} 
              required className="form-input" 
            />
            <input 
              placeholder="Descripción" 
              value={formP.desc || ''} // El || '' evita errores si es undefined
              onChange={e => setFormP({...formP, desc: e.target.value})} 
              className="form-input" 
            />
            <input 
              placeholder="Precio" 
              type="number" 
              value={formP.precio} 
              onChange={e => setFormP({...formP, precio: e.target.value})} 
              required className="form-input" 
            />
            <input 
              placeholder="URL Imagen (ej: /img/pollo.png)" 
              value={formP.img || ''} 
              onChange={e => setFormP({...formP, img: e.target.value})} 
              className="form-input" 
            />
            
            <div className="form-actions">
              <button type="submit" className={editandoProducto ? "btn-update" : "btn-main"}>
                {editandoProducto ? 'Actualizar Producto' : 'Guardar Producto'}
              </button>
              
              {editandoProducto && (
                <button type="button" onClick={limpiarFormP} className="btn-cancel">
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="list-mini">
              {productos.map(p => ( 
                <div key={p._id} className="item-mini">
                  <span>{p.nombre} <b>${p.precio}</b></span>
                  <div className="acciones-mini">
                    {/* Botón Editar: Carga todo el objeto (incluido el ID) al form */}
                    <button onClick={() => setFormP(p)} className="btn-icon-edit">
                      <FontAwesomeIcon icon={faPen}/>
                    </button>
                    <button onClick={() => borrarItem(p._id, 'products')} className="btn-icon-delete">
                      <FontAwesomeIcon icon={faTrash}/>
                    </button>
                  </div>
                </div> 
              ))}
          </div>
        </div>

        {/* COLUMNA 2: PROMOCIONES */}
        <div className="panel-box">
          <h3>{editandoPromo ? '✏️ Editando Promo' : '➕ Agregar Promoción'}</h3>
          
          <form onSubmit={guardarPromocion}>
            <input 
              placeholder="Nombre Promo" 
              value={formPromo.nombre} 
              onChange={e => setFormPromo({...formPromo, nombre: e.target.value})} 
              required className="form-input" 
            />
            <input 
              placeholder="Descripción" 
              value={formPromo.desc || ''} 
              onChange={e => setFormPromo({...formPromo, desc: e.target.value})} 
              className="form-input" 
            />
            <input 
              placeholder="Precio Promo" 
              type="number" 
              value={formPromo.precio} 
              onChange={e => setFormPromo({...formPromo, precio: e.target.value})} 
              required className="form-input" 
            />
            <input 
              placeholder="URL Imagen" 
              value={formPromo.img || ''} 
              onChange={e => setFormPromo({...formPromo, img: e.target.value})} 
              className="form-input" 
            />
            
            <div className="form-actions">
              <button type="submit" className={editandoPromo ? "btn-update" : "btn-main"}>
                {editandoPromo ? 'Actualizar Promoción' : 'Guardar Promoción'}
              </button>

              {editandoPromo && (
                <button type="button" onClick={limpiarFormPromo} className="btn-cancel">
                  <FontAwesomeIcon icon={faTimes} /> Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="list-mini">
              {promociones.map(p => ( 
                <div key={p._id} className="item-mini">
                  <span>{p.nombre}</span>
                  <div className="acciones-mini">
                    <button onClick={() => setFormPromo(p)} className="btn-icon-edit">
                      <FontAwesomeIcon icon={faPen}/>
                    </button>
                    <button onClick={() => borrarItem(p._id, 'promotions')} className="btn-icon-delete">
                      <FontAwesomeIcon icon={faTrash}/>
                    </button>
                  </div>
                </div> 
              ))}
          </div>
        </div>

        {/* COLUMNA 3: CUPONES (Sin editar, usualmente solo se borran) */}
        <div className="panel-box">
          <h3>Crear Cupón</h3>
          <form onSubmit={guardarCupon}>
            <input 
              placeholder="Código (ej: POLLO20)" 
              value={formC.codigo} 
              onChange={e => setFormC({...formC, codigo: e.target.value.toUpperCase()})} 
              required className="form-input" 
            />
            <input 
              placeholder="Cantidad Descuento" 
              type="number" 
              value={formC.descuento} 
              onChange={e => setFormC({...formC, descuento: e.target.value})} 
              required className="form-input" 
            />
            <select value={formC.tipo} onChange={e => setFormC({...formC, tipo: e.target.value})} className="form-input">
              <option value="fijo">Pesos ($)</option>
              <option value="porcentaje">Porcentaje (%)</option>
            </select>
            <button type="submit" className="btn-main">Crear Cupón</button>
          </form>
          <div className="list-mini">
              {cupones.map(c => ( 
                <div key={c._id} className="item-mini">
                  <span>{c.codigo} (-{c.descuento}{c.tipo === 'porcentaje' ? '%' : '$'})</span> 
                  <button onClick={() => borrarItem(c._id, 'coupons')} className="btn-icon-delete">
                    <FontAwesomeIcon icon={faTrash}/>
                  </button>
                </div> 
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;