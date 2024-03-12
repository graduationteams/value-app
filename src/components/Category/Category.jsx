import React from "react";
import "./Category.module.css";

export default function Category() {
  return (
    <div className="flex-container">
      <div className="cat">
        <a href="#">
          <p className="cat-p">Household Supplies</p>
          <img src="./images/tide.png" alt="value-logo" />
        </a>
      </div>
      <div className="cat">
        <a href="#">
          <p className="cat-p">Food and Groceries</p>
          <img
            src="assets/images/food.png"
            className="food-img"
            alt="value-logo"
          />
        </a>
      </div>
      <div className="cat">
        <a href="#">
          <p className="cat-p">Personal Care and Hygiene</p>
          <img src="./images/personal.png" alt="value-logo" />
        </a>
      </div>

      <div className="flex-container2">
        <div className="cat">
          <a href="#">
            <p className="cat-p">Electronics and Accessories</p>
            <img
              src="./images/headset.png"
              className="headset-img"
              alt="value-logo"
            />
          </a>
        </div>
        <div className="cat">
          <a href="#">
            <p className="cat-p">Medical Supplies</p>
            <img
              src="./images/panadol.png"
              className="panadol-img"
              alt="value-logo"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
