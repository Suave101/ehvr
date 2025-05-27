import React from "react";
import logo from "../logo.svg";

const Header = ({ style }) => (
  <header
    style={{
      position: "relative",
      width: "100%",
      zIndex: 10,
      background: "#0D1F2D", // Gradient background
      padding: "1rem 0",
      ...style
    }}
  >
    <div className="container-fluid d-flex align-items-center justify-content-between flex-wrap flex-md-nowrap px-3">
      <div className="d-flex align-items-center mb-2 mb-md-0">
        <img src={logo} alt="Logo" style={{ height: 40 }} />
      </div>
      <nav className="d-flex flex-wrap flex-column flex-md-row align-items-center gap-2 gap-md-3 w-100 justify-content-md-end justify-content-center">
        <a href="#offers" className="text-white text-decoration-none fw-semibold px-2 py-1">Offers</a>
        <a href="#stay" className="text-white text-decoration-none fw-semibold px-2 py-1">Stay</a>
        <a href="#dine" className="text-white text-decoration-none fw-semibold px-2 py-1">Dine</a>
        <a href="#experience" className="text-white text-decoration-none fw-semibold px-2 py-1">Experience</a>
        <a href="#meetings" className="text-white text-decoration-none fw-semibold px-2 py-1">Meetings</a>
        <a href="#gallery" className="text-white text-decoration-none fw-semibold px-2 py-1">Gallery</a>
        <button
          className="btn p-2 ms-0 ms-md-2"
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
        <button className="btn btn-primary fw-bold px-3 py-2 mt-2 mt-md-0 ms-0 ms-md-2" style={{ borderRadius: 10 }}>
          Book Now
        </button>
      </nav>
    </div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <style>{`
      @media (max-width: 767px) {
        header {
          padding: 0.5rem 0 !important;
        }
        .container-fluid {
          flex-direction: column !important;
          align-items: stretch !important;
        }
        nav {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 0.5rem !important;
        }
        nav a, nav button {
          width: 100%;
          text-align: center;
          margin: 0 !important;
          padding: 0.75rem 0.5rem !important;
        }
        .btn-primary {
          width: 100%;
        }
      }
    `}</style>
  </header>
);

export default Header;