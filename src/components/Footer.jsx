import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faClock } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
          <div className="footer-col">
              <h4>Pollería Pamy's</h4>
              <p>¡El sabor que te hace volver!</p>
              <p>© 2025 - Durango, Dgo.</p>
          </div>
          <div className="footer-col">
              <h4><FontAwesomeIcon icon={faClock} /> Horario</h4>
              <p>9:30 a.m. – 6:30 p.m.</p>
          </div>
          <div className="footer-col">
              <h4>Contacto</h4>
              <p><FontAwesomeIcon icon={faPhone} /> 618 836 1213</p>
              <p><a href="https://maps.app.goo.gl/GZ3UBJCTAcQ9sJvY8" target="_blank" rel="noreferrer" style={{color:'orange'}}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Ver Ubicación
              </a></p>
          </div>
      </div>
    </footer>
  );
};

export default Footer;