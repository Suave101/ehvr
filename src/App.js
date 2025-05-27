import React from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <FrontPage />
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

  // Returns available rooms based on search criteria using the described schema
  const getAvailableRooms = async ({ building, guests, arrival, departure }) => {
    if (!arrival || !departure) return [];

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = 'https://your-project.supabase.co';
    const supabaseKey = 'public-anon-key';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Find hotel by name (building)
    let hotelQuery = supabase.from('hotels').select('id').ilike('name', `%${building}%`);
    const { data: hotels, error: hotelError } = await hotelQuery;
    if (hotelError || !hotels || hotels.length === 0) return [];

    const hotelId = hotels[0].id;

    // 2. Find room_types that fit guest count
    let roomTypeQuery = supabase
      .from('room_types')
      .select('id')
      .eq('hotel_id', hotelId)
      .gte('max_occupancy', guests);
    const { data: roomTypes, error: roomTypeError } = await roomTypeQuery;
    if (roomTypeError || !roomTypes || roomTypes.length === 0) return [];

    const roomTypeIds = roomTypes.map(rt => rt.id);

    // 3. Find active rooms of those types
    let roomQuery = supabase
      .from('rooms')
      .select('id, room_number')
      .eq('hotel_id', hotelId)
      .in('room_type_id', roomTypeIds)
      .eq('is_active', true);
    const { data: rooms, error: roomError } = await roomQuery;
    if (roomError || !rooms || rooms.length === 0) return [];

    const roomIds = rooms.map(r => r.id);

    // 4. Find rooms with overlapping reservations
    let reservationQuery = supabase
      .from('reservations')
      .select('room_id')
      .in('room_id', roomIds)
      .or(
        `and(check_in_date,lt.${departure},check_out_date,gt.${arrival})`
      );
    const { data: reservations } = await reservationQuery;
    const reservedRoomIds = reservations ? reservations.map(r => r.room_id) : [];

    // 5. Find rooms with blockout dates in range
    let blockoutQuery = supabase
      .from('room_blockout_dates')
      .select('room_id')
      .in('room_id', roomIds)
      .gte('block_date', arrival)
      .lt('block_date', departure);
    const { data: blockouts } = await blockoutQuery;
    const blockedRoomIds = blockouts ? blockouts.map(b => b.room_id) : [];

    // 6. Filter out reserved and blocked rooms
    const unavailableRoomIds = new Set([...reservedRoomIds, ...blockedRoomIds]);
    const availableRooms = rooms.filter(r => !unavailableRoomIds.has(r.id));

    return availableRooms;
  };

  const handleSearch = async () => {
    // Example Supabase query (adjust table/column names as needed)
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = 'https://your-project.supabase.co';
    const supabaseKey = 'public-anon-key';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
      .from('buildings')
      .select('*')
      .ilike('name', `%${building}%`)
      .gte('max_guests', guests);

    if (arrival) query = query.gte('available_from', arrival);
    if (departure) query = query.lte('available_to', departure);

    const { data, error } = await query;
    if (onSearch) {
      onSearch({ building, guests, arrival, departure, data, error });
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
            <option value="">Select building</option>
            <option value="Amara">Amara Building</option>
            <option value="Bonita">Bonita Building</option>
            <option value="Cordova">Cordova Building</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Guests</label>
          <input
            type="number"
            min="1"
            className="form-control"
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
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
