import React from 'react';

const Navbar = () => {
    return (
        <div className="container-nav">
        <nav className="bottom-nav">
          <a href="#">
            <img src="./images/value-logo.png" alt="value-logo" />
          </a>
          <a href="#">
            <img src="./images/basket.png" alt="value-logo" />
          </a>
          <a href="#">
            <img src="./images/Orders.png" alt="value-logo" />
          </a>
          <a href="#">
            <img src="./images/Account.png" alt="value-logo" />
          </a>
        </nav>
        <br />
      </div>
    );
}

export default Navbar;
