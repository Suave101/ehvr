import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import ViewRooms from "./pages/ViewRooms";
import supabase from './utils/supabaseClient';

function App() {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/rooms" element={<ViewRooms />} />
    </Routes>
  </Router>
  );
}

// Amara Building
// Bonita Building
// Cordova Building

function SearchBar({ onSearch }) {
  const [query, setQuery] = React.useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const [building, setBuilding] = React.useState("");
  const [guests, setGuests] = React.useState(1);
  const [arrival, setArrival] = React.useState("");
  const [departure, setDeparture] = React.useState("");

  const navigate = useNavigate();

  const handleSearch = async () => {
    let hotelId = null;

    // Handle "All Building" option
    // If building is "*" or empty, do not filter by hotel_id
    if (building && building !== "*") {
      const { data: hotelData, error: hotelError } = await supabase
        .from('hotels')
        .select('id')
        .eq('name', building)
        .single();
      if (hotelError) {
        alert('Error finding hotel: ' + hotelError.message);
        return;
      }
      hotelId = hotelData?.id;
    }

    // 2. Build room query
    let roomQuery = supabase
      .from('rooms')
      .select(`
        id, room_number, hotel_id, room_type_id, is_active,
        room_types (
          id, name, max_occupancy
        )
      `)
      .eq('is_active', true);

    // Only filter by hotel_id if a specific building is selected
    if (hotelId) {
      roomQuery = roomQuery.eq('hotel_id', hotelId);
    }

    // 3. Filter by guest count (room_types.max_occupancy)
    if (guests) {
      roomQuery = roomQuery.gte('room_types.max_occupancy', guests);
    }

    // 4. Get all candidate rooms
    const { data: rooms, error: roomError } = await roomQuery;
    if (roomError) {
      alert('Error fetching rooms: ' + roomError.message);
      return;
    }
    if (!rooms || rooms.length === 0) {
      alert('No rooms found matching your criteria.');
      return;
    }

    // 5. Filter out rooms with overlapping reservations or blockout dates
    const availableRooms = [];
    console.log('Found rooms:', rooms);
    for (const room of rooms) {
      // Fetch all reservations for this room
      const { data: reservations, error: resError } = await supabase
        .from('reservations')
        .select('check_in_date, check_out_date')
        .eq('room_id', room.id);

      if (resError) continue;

      // Check for overlap in JS
      const hasOverlap = reservations?.some(res =>
        new Date(res.check_in_date) < new Date(departure) &&
        new Date(res.check_out_date) > new Date(arrival)
      );
      if (hasOverlap) continue;

      // Check for blockout dates
      const { data: blockouts, error: blockError } = await supabase
        .from('room_blockout_dates')
        .select('block_date')
        .eq('room_id', room.id)
        .gte('block_date', arrival)
        .lt('block_date', departure);

      if (blockError) continue;
      if (blockouts && blockouts.length > 0) continue;

      availableRooms.push(room);
    }

    // Show results (for demo, just alert)
    if (availableRooms.length === 0) {
      alert('No available rooms for the selected dates and criteria.');
      // Optionally, you can still navigate and show an empty list
      navigate("/rooms", { state: { rooms: [] } });
    } else {
      // Pass the availableRooms to the /rooms page
      navigate("/rooms", { state: { rooms: availableRooms } });
    }

  };

  return (
    <div
      style={{
        width: "100%",
        background: "transparent",
        borderRadius: "1rem",
        boxShadow: "none",
        zIndex: 20,
        padding: 0
      }}
      className="px-5 px-md-5 px-lg-5 px-xl-5"
    >
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Building</label>
          <select
            className="form-select"
            value={building}
            onChange={e => setBuilding(e.target.value)}
          >
            <option value="*">All Building</option>
            <option value="Amara Hotel">Amara</option>
            <option value="Bonita Hotel">Bonita</option>
            <option value="Cordova Hotel">Cordova</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Guests</label>
          <input
            type="number"
            min="1"
            step="1"
            className="form-control"
            value={guests}
            onChange={e => {
              // Prevent decimals
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                setGuests(Number(val));
              }
            }}
            onWheel={e => e.target.blur()}
            onKeyDown={e => {
              if (e.key === '.' || e.key === 'e') {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Arrival</label>
          <input
            type="date"
            className="form-control"
            value={arrival}
            onChange={e => setArrival(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <label className="form-label">Departure</label>
          <input
            type="date"
            className="form-control"
            value={departure}
            onChange={e => setDeparture(e.target.value)}
          />
        </div>
        <div className="col-md-3 d-flex align-items-end">
          <button className="btn btn-primary w-100 py-2 fs-6" onClick={handleSearch}>
            <i className="bi bi-suitcase-fill me-2"></i>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function FrontPage() {
  return (
    <div className="">
      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
          background: "transparent",
          padding: "1rem 0"
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
      <div
        id="buildingCarousel"
        className="carousel slide position-relative"
        data-bs-ride="carousel"
        style={{
          width: "100%",
          maxHeight: "420px",
          overflow: "hidden",
          position: "relative"
        }}
      >
        <div className="carousel-inner" style={{ width: "100%", height: "420px" }}>
          <div className="carousel-item active" style={{ width: "100%", height: "420px" }}>
            <img
              src="https://www.wyndhamhotels.com/content/dam/property-images/en-us/gn/us/fl/fort-walton-beach/05545/05545_exterior_view_6.jpg"
              className="d-block w-100"
              alt="Amara Building"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "420px"
              }}
            />
          </div>
          <div className="carousel-item" style={{ width: "100%", height: "420px" }}>
            <img
              src="https://www.kayak.com/rimg/himg/d1/67/a9/ice-23276-d4e23c-406614.jpg?width=1366&height=768&crop=true"
              className="d-block w-100"
              alt="Bonita Building"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "420px"
              }}
            />
          </div>
          <div className="carousel-item" style={{ width: "100%", height: "420px" }}>
            <img
              src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/c2/ca/ad/pool-beach-street-cottages.jpg?w=1200&h=-1&s=1"
              className="d-block w-100"
              alt="Cordova Building"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "420px"
              }}
            />
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#buildingCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#buildingCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
        {/* SearchBar absolutely positioned inside carousel */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: "0px",
            width: "100vw",
            maxWidth: "100%",
            pointerEvents: "auto",
            zIndex: 20,
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.65) 40%, rgba(255,255,255,0.85) 100%)",
            borderRadius: 0,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            margin: "0 auto",
            paddingLeft: 0,
            paddingRight: 0
          }}
        >
          <div className="container-fluid py-3">
            <SearchBar />
          </div>
        </div>
      </div>
      {/* Building description area restored below carousel */}
      <div className="container mt-5">
        <div className="row g-5 mb-5">
          {/* Amara */}
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100">
              <img src="https://www.wyndhamhotels.com/content/dam/property-images/en-us/gn/us/fl/fort-walton-beach/05545/05545_exterior_view_6.jpg" alt="Amara Building" className="card-img-top rounded-top" />
              <div className="card-body d-flex flex-column">
                <h4 className="card-title text-primary fw-bold mb-2">
                  <i className="bi bi-flower1 me-2"></i>Amara Building
                </h4>
                <p className="card-text flex-grow-1">
                  <span className="badge bg-info text-dark mb-2">Serenity</span>
                  <br />
                  <span className="fw-semibold">A Sanctuary of Calm</span>
                  <br />
                  Embrace timeless beauty and tranquility at The Amara Hotel, your exquisite retreat on Okaloosa Island. Unwind in elegantly appointed rooms, bask in the glow of coastal sunsets, and let the gentle Gulf breeze soothe your soul. Every detail is designed for pure relaxation—discover your personal oasis just steps from the emerald waters.
                </p>
                <ul className="list-unstyled mb-3">
                  <li><i className="bi bi-water me-2 text-info"></i>Beachfront Views</li>
                  <li><i className="bi bi-spa me-2 text-success"></i>Luxury Spa</li>
                  <li><i className="bi bi-cup-straw me-2 text-warning"></i>Sunset Lounge</li>
                </ul>
                <a href="#amara" className="btn btn-outline-primary mt-auto">Explore Amara</a>
              </div>
            </div>
          </div>
          {/* Bonita */}
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100">
              <img src="https://www.kayak.com/rimg/himg/d1/67/a9/ice-23276-d4e23c-406614.jpg?width=1366&height=768&crop=true" alt="Bonita Building" className="card-img-top rounded-top" />
              <div className="card-body d-flex flex-column">
                <h4 className="card-title text-danger fw-bold mb-2">
                  <i className="bi bi-sun-fill me-2"></i>Bonita Building
                </h4>
                <p className="card-text flex-grow-1">
                  <span className="badge bg-warning text-dark mb-2">Vibrance</span>
                  <br />
                  <span className="fw-semibold">Where Beauty Meets Energy</span>
                  <br />
                  Step into the captivating charm of The Bonita Hotel, where vibrant spaces and dazzling design reflect the spirit of Okaloosa Island. Enjoy lively social areas, creative cuisine, and a playful atmosphere perfect for making memories. Bonita is your gateway to fun, sun, and the best of the Gulf Coast.
                </p>
                <ul className="list-unstyled mb-3">
                  <li><i className="bi bi-people-fill me-2 text-danger"></i>Family Friendly</li>
                  <li><i className="bi bi-music-note-beamed me-2 text-primary"></i>Live Entertainment</li>
                  <li><i className="bi bi-cup-hot me-2 text-warning"></i>Beach Café</li>
                </ul>
                <a href="#bonita" className="btn btn-outline-danger mt-auto">Explore Bonita</a>
              </div>
            </div>
          </div>
          {/* Cordova */}
          <div className="col-md-4">
            <div className="card shadow-lg border-0 h-100">
              <img src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/c2/ca/ad/pool-beach-street-cottages.jpg?w=1200&h=-1&s=1" alt="Cordova Building" className="card-img-top rounded-top" />
              <div className="card-body d-flex flex-column">
                <h4 className="card-title text-secondary fw-bold mb-2">
                  <i className="bi bi-gem me-2"></i>Cordova Building
                </h4>
                <p className="card-text flex-grow-1">
                  <span className="badge bg-secondary mb-2">Elegance</span>
                  <br />
                  <span className="fw-semibold">Classic Sophistication</span>
                  <br />
                  Experience the refined charm of The Cordova Hotel, where timeless elegance meets modern comfort. Overlooking sugar-white beaches, Cordova offers a distinguished stay with curated amenities, attentive service, and a peaceful ambiance. Discover a heritage of hospitality and sophistication on Florida’s beautiful shoreline.
                </p>
                <ul className="list-unstyled mb-3">
                  <li><i className="bi bi-building me-2 text-secondary"></i>Historic Design</li>
                  <li><i className="bi bi-wifi me-2 text-info"></i>High-Speed WiFi</li>
                  <li><i className="bi bi-cup me-2 text-success"></i>Elegant Lounge</li>
                </ul>
                <a href="#cordova" className="btn btn-outline-secondary mt-auto">Explore Cordova</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="bg-dark text-light pt-5 pb-3 mt-5">
        <div className="container">
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <h6 className="text-uppercase fw-bold mb-3">Contact Us</h6>
              <p className="mb-1">Emerald Horizon Resort</p>
              <p className="mb-1">123 Beachfront Ave, Okaloosa Island, FL 32548</p>
              <p className="mb-1">Phone: <a href="tel:+18555551234" className="text-light text-decoration-underline">+1 855-555-1234</a></p>
              <p className="mb-1">Email: <a href="mailto:info@emeraldhorizon.com" className="text-light text-decoration-underline">info@emeraldhorizon.com</a></p>
            </div>
            <div className="col-md-2 mb-3">
              <h6 className="text-uppercase fw-bold mb-3">Hotel Info</h6>
              <ul className="list-unstyled">
                <li><a href="#offers" className="text-light text-decoration-none">Offers</a></li>
                <li><a href="#stay" className="text-light text-decoration-none">Stay</a></li>
                <li><a href="#dine" className="text-light text-decoration-none">Dine</a></li>
                <li><a href="#experience" className="text-light text-decoration-none">Experience</a></li>
                <li><a href="#meetings" className="text-light text-decoration-none">Meetings</a></li>
                <li><a href="#gallery" className="text-light text-decoration-none">Gallery</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-3">
              <h6 className="text-uppercase fw-bold mb-3">Policies</h6>
              <ul className="list-unstyled">
                <li><a href="#" className="text-light text-decoration-none">Privacy Policy</a></li>
                <li><a href="#" className="text-light text-decoration-none">Terms of Use</a></li>
                <li><a href="#" className="text-light text-decoration-none">Accessibility</a></li>
                <li><a href="#" className="text-light text-decoration-none">Cookie Policy</a></li>
              </ul>
            </div>
            <div className="col-md-3 mb-3">
              <h6 className="text-uppercase fw-bold mb-3">Connect</h6>
              <div className="d-flex gap-3">
                <a href="#" className="text-light" aria-label="Facebook"><i className="bi bi-facebook fs-4"></i></a>
                <a href="#" className="text-light" aria-label="Instagram"><i className="bi bi-instagram fs-4"></i></a>
                <a href="#" className="text-light" aria-label="Twitter"><i className="bi bi-twitter fs-4"></i></a>
                <a href="#" className="text-light" aria-label="LinkedIn"><i className="bi bi-linkedin fs-4"></i></a>
              </div>
              <div className="mt-3">
                <span className="d-block mb-1">Sign up for exclusive offers:</span>
                <form className="d-flex">
                  <input type="email" className="form-control form-control-sm me-2" placeholder="Email address" />
                  <button type="submit" className="btn btn-warning btn-sm">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
          <div className="text-center small">
            &copy; {new Date().getFullYear()} Emerald Horizon Resort. All rights reserved.
          </div>
        </div>
        {/* Bootstrap Icons CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </footer>
    </div>
  )
}

export default App;
