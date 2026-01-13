import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons';

const Hero = ({ scrollFn }) => {
  return (
    <div className="hero">
      <div className="hero-overlay">
        <h1>¡El mejor pollo de la ciudad!</h1>
        <p>Crujiente, jugoso y al mejor precio.</p>
        <button className="btn-hero" onClick={scrollFn}>
           Ver Cupones <FontAwesomeIcon icon={faArrowDown} />
        </button>
      </div>
    </div>
  );
};

export default Hero;