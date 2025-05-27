import React from "react";
import logo from "../logo.svg";

const Header = ({ style }) => (
  <header
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: 10,
      background: "linear-gradient(0deg,rgba(0, 0, 0, 0.07) 0%,rgba(0, 0, 0, 0.28) 100%)", // Gradient background
      padding: "1rem 0",
      ...style // Allow override from props
    }}
  >
    <div className="container-fluid d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </div>
      <nav className="d-flex align-items-center gap-3">
        <a href="#offers" className="text-white text-decoration-none fw-semibold px-2">Offers</a>
        <a href="#stay" className="text-white text-decoration-none fw-semibold px-2">Stay</a>
        <a href="#dine" className="text-white text-decoration-none fw-semibold px-2">Dine</a>
        <a href="#experience" className="text-white text-decoration-none fw-semibold px-2">Experience</a>
        <a href="#meetings" className="text-white text-decoration-none fw-semibold px-2">Meetings</a>
        <a href="#gallery" className="text-white text-decoration-none fw-semibold px-2">Gallery</a>
        <button
          className="btn p-2 ms-2"
          style={{
            background: "transparent",
            border: "none",
            color: "white"
          }}
          aria-label="Call"
        >
          <span className="material-icons" style={{ fontSize: 24, verticalAlign: "middle" }}>
            phone
          </span>
        </button>
        <button className="btn btn-primary ms-2 fw-bold px-3 py-2" style={{ borderRadius: 10 }}>
          Book Now
        </button>
      </nav>
    </div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
  </header>
);

export default Header;