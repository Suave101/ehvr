import React from "react";
import supabase from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = React.useState("");
  const [building, setBuilding] = React.useState("");
  const [guests, setGuests] = React.useState(1);
  const [arrival, setArrival] = React.useState("");
  const [departure, setDeparture] = React.useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleSearch = async () => {
    let hotelId = null;

    // Handle "All Building" option
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

    if (availableRooms.length === 0) {
      alert('No available rooms for the selected dates and criteria.');
      navigate("/rooms", { state: { rooms: [] } });
    } else {
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
};

export default SearchBar;