import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";

// Add Google Fonts link for 'Roboto Slab'
const GoogleFonts = () => (
  <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@700&display=swap" rel="stylesheet" />
);

// Simple loading spinner
const Spinner = () => (
  <span style={{ display: "inline-block", width: 18, height: 18, verticalAlign: "middle" }}>
    <svg width="18" height="18" viewBox="0 0 38 38" stroke="#00bcd4">
      <g fill="none" fillRule="evenodd">
        <g transform="translate(1 1)" strokeWidth="3">
          <circle strokeOpacity=".3" cx="18" cy="18" r="18"/>
          <path d="M36 18c0-9.94-8.06-18-18-18">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 18 18"
              to="360 18 18"
              dur="0.9s"
              repeatCount="indefinite"/>
          </path>
        </g>
      </g>
    </svg>
  </span>
);

// Helper: get image for room type or room number
const getRoomImage = (room) => {
    // You can customize this mapping as needed
    const type = room.room_types?.name?.toLowerCase() || "";
    if (type.includes("amara")) {
        return "https://www.wyndhamhotels.com/content/dam/property-images/en-us/gn/us/fl/fort-walton-beach/05545/05545_exterior_view_6.jpg";
    }
    if (type.includes("bonita")) {
        return "https://www.kayak.com/rimg/himg/d1/67/a9/ice-23276-d4e23c-406614.jpg?width=1366&height=768&crop=true";
    }
    if (type.includes("cordova")) {
        return "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/c2/ca/ad/pool-beach-street-cottages.jpg?w=1200&h=-1&s=1";
    }
    // Fallback image
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
};

const ViewRooms = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;
    const [rooms, setRooms] = React.useState(state?.rooms || []);
    const [loading, setLoading] = React.useState(false);

    // New: Track loading and data for price/amenities per room
    const [roomTypeDetails, setRoomTypeDetails] = React.useState({});

    React.useEffect(() => {
        // If we only have room IDs, fetch full room info from Supabase
        if (rooms.length > 0 && typeof rooms[0] === "number") {
            setLoading(true);
            supabase
                .from("rooms")
                .select(`
                    id, room_number, hotel_id, room_type_id, is_active,
                    room_types (
                        id, name
                    )
                `)
                .in("id", rooms)
                .then(({ data, error }) => {
                    setLoading(false);
                    if (error) {
                        alert("Error fetching room info: " + error.message);
                        setRooms([]);
                    } else {
                        setRooms(data);
                    }
                });
        }
    }, [rooms]);

    // After page loads, fetch price and amenities for each room type
    React.useEffect(() => {
        const fetchRoomTypeDetails = async () => {
            const uniqueRoomTypeNames = [
                ...new Set(
                    rooms
                        .map(room => room.room_types?.name)
                        .filter(Boolean)
                ),
            ];
            if (uniqueRoomTypeNames.length === 0) return;

            // Fetch details for each unique room type name
            const updates = {};
            await Promise.all(
                uniqueRoomTypeNames.map(async (name) => {
                    const { data, error } = await supabase
                        .from("room_types")
                        .select("name, base_price_per_night, amenities, max_occupancy")
                        .eq("name", name)
                        .single();
                    if (!error && data) {
                        updates[name] = data;
                    }
                })
            );
            setRoomTypeDetails(prev => ({ ...prev, ...updates }));
        };
        fetchRoomTypeDetails();
    }, [rooms]);

    // --- Featured Rooms Calculation ---
    const getFeaturedRooms = () => {
        if (!rooms.length || Object.keys(roomTypeDetails).length === 0) return [];

        // Attach type details to each room for easier sorting/filtering
        const roomsWithDetails = rooms
            .map(room => {
                const typeName = room.room_types?.name;
                const details = typeName ? roomTypeDetails[typeName] : null;
                return details
                    ? { ...room, typeDetails: details }
                    : null;
            })
            .filter(Boolean);

        if (!roomsWithDetails.length) return [];

        // Most expensive room
        const mostExpensive = [...roomsWithDetails].sort(
            (a, b) => (b.typeDetails.base_price_per_night || 0) - (a.typeDetails.base_price_per_night || 0)
        )[0];

        // Room with most amenities
        const mostAmenities = [...roomsWithDetails].sort(
            (a, b) => (b.typeDetails.amenities?.length || 0) - (a.typeDetails.amenities?.length || 0)
        )[0];

        // Cheapest room for at least 2 people
        const forTwo = roomsWithDetails.filter(
            r => (r.typeDetails.max_occupancy || 0) >= 2
        );
        const cheapestForTwo = forTwo.length
            ? [...forTwo].sort(
                (a, b) => (a.typeDetails.base_price_per_night || Infinity) - (b.typeDetails.base_price_per_night || Infinity)
              )[0]
            : null;

        // Avoid duplicates in featured
        const featured = [];
        if (mostExpensive) featured.push(mostExpensive);
        if (mostAmenities && mostAmenities.id !== mostExpensive?.id) featured.push(mostAmenities);
        if (cheapestForTwo && !featured.some(r => r.id === cheapestForTwo.id)) featured.push(cheapestForTwo);

        return featured;
    };

    const featuredRooms = getFeaturedRooms();

    if (!state || !state.rooms) {
        return <div>No rooms data provided.</div>;
    }

    if (loading) {
        return <div>Loading room details...</div>;
    }

    const handleRoomClick = (room) => {
        navigate(`/rooms/${room.id}`, { state: { room } });
    };

    // Custom header style for this page
    const headerStyle = {
        position: "relative",
        width: "100%",
        background: "rgba(0,0,0,0.95)", // Opaque
        padding: "1rem 0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    };

    return (
        <>
            <GoogleFonts />
            <Header style={headerStyle} />
            {/* Featured Rooms Section */}
            {featuredRooms.length > 0 && (
                <div className="container mb-5" style={{ marginTop: "2rem" }}>
                    <h2 className="fw-bold mb-5 text-center" style={{
                        fontFamily: "'Roboto Slab', serif",
                        fontWeight: 900,
                        color: "#0d6efd",
                        letterSpacing: 2,
                        fontSize: "2.2rem",
                        textShadow: "0 2px 8px #b2eaff, 0 1px 0 #fff",
                        background: "none",
                        WebkitBackgroundClip: "unset",
                        WebkitTextFillColor: "unset",
                        filter: "none",
                        borderRadius: 12,
                        padding: "0.5rem 0"
                    }}>
                        Featured Accommodations
                    </h2>
                    <div className="row g-4 align-items-end" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {/* Place the Luxury Experience (idx 0) in the center column, higher than others */}
                        <div className="col-12 col-md-4 order-1 order-md-2 d-flex align-items-stretch mb-4 mb-md-0 featured-card-mobile" style={{ zIndex: 2, marginBottom: '-32px' }}>
                            <div className="w-100 h-100 d-flex">
                                {featuredRooms[0] && (() => {
                                    const room = featuredRooms[0];
                                    const { typeDetails } = room;
                                    return (
                                        <div className="card shadow h-100" style={{
                                            boxShadow: 'none',
                                            border: '2px solid #ff9800',
                                            borderRadius: 12,
                                            overflow: 'hidden'
                                        }}>
                                            <div className="card-header text-center" style={{
                                                background: "linear-gradient(90deg,#ff9800 0%,#ffd600 100%)",
                                                color: "#fff",
                                                fontWeight: 800,
                                                fontSize: 20,
                                                letterSpacing: 1,
                                                textTransform: "uppercase",
                                                border: '2px solid #ff9800',
                                                borderTopLeftRadius: 12,
                                                borderTopRightRadius: 12,
                                                borderBottom: 'none'
                                            }}>
                                                Luxury Experience
                                            </div>
                                            <img
                                                src={getRoomImage(room)}
                                                alt={typeDetails?.name || "Room"}
                                                className="card-img-top"
                                                style={{ objectFit: "cover", height: 200 }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title text-center" style={{ fontFamily: "'Roboto Slab', serif", fontSize: "2rem" }}>{typeDetails?.name}</h5>
                                                <div className="text-center mb-2" style={{ fontWeight: 700, color: '#0d6efd', fontSize: '1.2rem', letterSpacing: 1 }}>Room {room.room_number}</div>
                                                <div className="mb-2 text-center fs-5">
                                                    <span className="fw-bold text-success">{typeDetails ? `$${typeDetails.base_price_per_night}` : <Spinner />}</span>
                                                    <span className="text-muted ms-1">/ night</span>
                                                </div>
                                                <div className="mb-2 text-center" style={{ fontSize: '1rem', color: '#555' }}>
                                                    {(() => {
                                                        const letter = String(room.room_number).charAt(0).toUpperCase();
                                                        if (letter === 'A') return 'Amara Hotel';
                                                        if (letter === 'B') return 'Bonita Hotel';
                                                        if (letter === 'C') return 'Cordova Hotel';
                                                        return 'Emerald Horizon';
                                                    })()}
                                                </div>
                                                <ul className="list-unstyled mb-2">
                                                    <li><strong>Max Occupancy:</strong> {typeDetails ? typeDetails.max_occupancy : <Spinner />}</li>
                                                    <li><strong>Amenities:</strong> {typeDetails ? (typeDetails.amenities?.join(", ") || "N/A") : <Spinner />}</li>
                                                </ul>
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        className="btn btn-gradient-primary btn-lg px-4 shadow-sm ehvr-btn-wave"
                                                        style={{
                                                            background: room.is_active ? "linear-gradient(90deg,#0d6efd 0%,#00bcd4 100%)" : undefined,
                                                            color: room.is_active ? "#fff" : undefined,
                                                            border: "none",
                                                            fontWeight: 700,
                                                            fontSize: 18,
                                                            opacity: room.is_active ? 1 : 0.7
                                                        }}
                                                        disabled={!room.is_active}
                                                        tabIndex={-1}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            if (room.is_active) handleRoomClick(room);
                                                        }}
                                                    >
                                                        <span>View Details</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        {/* Left: Most Amenities */}
                        <div className="col-12 col-md-4 order-2 order-md-1 d-flex align-items-stretch mb-4 mb-md-0 featured-card-mobile">
                            <div className="w-100 h-100 d-flex">
                                {featuredRooms[1] && (() => {
                                    const room = featuredRooms[1];
                                    const { typeDetails } = room;
                                    return (
                                        <div className="card shadow h-100" style={{
                                            border: '2px solid #0d6efd',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: 'none'
                                        }}>
                                            <div className="card-header text-center" style={{
                                                background: "linear-gradient(90deg,#00bcd4 0%,#0d6efd 100%)",
                                                color: "#fff",
                                                fontWeight: 800,
                                                fontSize: 18,
                                                letterSpacing: 1,
                                                textTransform: "uppercase",
                                                border: '2px solid #0d6efd',
                                                borderTopLeftRadius: '12px',
                                                borderTopRightRadius: '12px',
                                                borderBottom: 'none'
                                            }}>
                                                Most Amenities
                                            </div>
                                            <img
                                                src={getRoomImage(room)}
                                                alt={typeDetails?.name || "Room"}
                                                className="card-img-top"
                                                style={{ objectFit: "cover", height: 180 }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title text-center" style={{ fontFamily: "'Roboto Slab', serif", fontSize: "2rem" }}>{typeDetails?.name}</h5>
                                                <div className="text-center mb-2" style={{ fontWeight: 700, color: '#0d6efd', fontSize: '1.2rem', letterSpacing: 1 }}>Room {room.room_number}</div>
                                                <div className="mb-2 text-center fs-5">
                                                    <span className="fw-bold text-success">{typeDetails ? `$${typeDetails.base_price_per_night}` : <Spinner />}</span>
                                                    <span className="text-muted ms-1">/ night</span>
                                                </div>
                                                <div className="mb-2 text-center" style={{ fontSize: '1rem', color: '#555' }}>
                                                    {(() => {
                                                        const letter = String(room.room_number).charAt(0).toUpperCase();
                                                        if (letter === 'A') return 'Amara Hotel';
                                                        if (letter === 'B') return 'Bonita Hotel';
                                                        if (letter === 'C') return 'Cordova Hotel';
                                                        return 'Emerald Horizon';
                                                    })()}
                                                </div>
                                                <ul className="list-unstyled mb-2">
                                                    <li><strong>Max Occupancy:</strong> {typeDetails ? typeDetails.max_occupancy : <Spinner />}</li>
                                                    <li><strong>Amenities:</strong> {typeDetails ? (typeDetails.amenities?.join(", ") || "N/A") : <Spinner />}</li>
                                                </ul>
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        className="btn btn-gradient-primary btn-lg px-4 shadow-sm ehvr-btn-wave"
                                                        style={{
                                                            background: room.is_active ? "linear-gradient(90deg,#0d6efd 0%,#00bcd4 100%)" : undefined,
                                                            color: room.is_active ? "#fff" : undefined,
                                                            border: "none",
                                                            fontWeight: 700,
                                                            fontSize: 18,
                                                            opacity: room.is_active ? 1 : 0.7
                                                        }}
                                                        disabled={!room.is_active}
                                                        tabIndex={-1}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            if (room.is_active) handleRoomClick(room);
                                                        }}
                                                    >
                                                        <span>View Details</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        {/* Right: Best Value */}
                        <div className="col-12 col-md-4 order-3 d-flex align-items-stretch mb-4 mb-md-0 featured-card-mobile best-value-mobile">
                            <div className="w-100 h-100 d-flex">
                                {featuredRooms[2] && (() => {
                                    const room = featuredRooms[2];
                                    const { typeDetails } = room;
                                    return (
                                        <div className="card shadow h-100" style={{
                                            border: '2px solid #43e97b',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            boxShadow: 'none',
                                            minHeight: '100%',
                                            maxHeight: '100%',
                                            width: '100%'
                                        }}>
                                            <div className="card-header text-center" style={{
                                                background: "linear-gradient(90deg,#43e97b 0%,#38f9d7 100%)",
                                                color: "#0d6f43",
                                                fontWeight: 800,
                                                fontSize: 18,
                                                letterSpacing: 1,
                                                textTransform: "uppercase",
                                                border: '2px solid #43e97b',
                                                borderTopLeftRadius: '12px',
                                                borderTopRightRadius: '12px',
                                                borderBottom: 'none'
                                            }}>
                                                Best Value
                                            </div>
                                            <img
                                                src={getRoomImage(room)}
                                                alt={typeDetails?.name || "Room"}
                                                className="card-img-top"
                                                style={{ objectFit: "cover", height: 180, width: '100%' }}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title text-center" style={{ fontFamily: "'Roboto Slab', serif", fontSize: "2rem" }}>{typeDetails?.name}</h5>
                                                <div className="text-center mb-2" style={{ fontWeight: 700, color: '#0d6efd', fontSize: '1.2rem', letterSpacing: 1 }}>Room {room.room_number}</div>
                                                <div className="mb-2 text-center fs-5">
                                                    <span className="fw-bold text-success">{typeDetails ? `$${typeDetails.base_price_per_night}` : <Spinner />}</span>
                                                    <span className="text-muted ms-1">/ night</span>
                                                </div>
                                                <div className="mb-2 text-center" style={{ fontSize: '1rem', color: '#555' }}>
                                                    {(() => {
                                                        const letter = String(room.room_number).charAt(0).toUpperCase();
                                                        if (letter === 'A') return 'Amara Hotel';
                                                        if (letter === 'B') return 'Bonita Hotel';
                                                        if (letter === 'C') return 'Cordova Hotel';
                                                        return 'Emerald Horizon';
                                                    })()}
                                                </div>
                                                <ul className="list-unstyled mb-2">
                                                    <li><strong>Max Occupancy:</strong> {typeDetails ? typeDetails.max_occupancy : <Spinner />}</li>
                                                    <li><strong>Amenities:</strong> {typeDetails ? (typeDetails.amenities?.join(", ") || "N/A") : <Spinner />}</li>
                                                </ul>
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        className="btn btn-gradient-primary btn-lg px-4 shadow-sm ehvr-btn-wave"
                                                        style={{
                                                            background: room.is_active ? "linear-gradient(90deg,#0d6efd 0%,#00bcd4 100%)" : undefined,
                                                            color: room.is_active ? "#fff" : undefined,
                                                            border: "none",
                                                            fontWeight: 700,
                                                            fontSize: 18,
                                                            opacity: room.is_active ? 1 : 0.7
                                                        }}
                                                        disabled={!room.is_active}
                                                        tabIndex={-1}
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            if (room.is_active) handleRoomClick(room);
                                                        }}
                                                    >
                                                        <span>View Details</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @media (max-width: 767px) {
                          .row.g-4 > [class*='col-12'] > .d-flex {
                            min-height: 370px;
                            max-height: 370px;
                            margin-bottom: 1.2rem !important;
                            width: 100% !important;
                          }
                          .featured-card-mobile {
                            margin-bottom: 1.2rem !important;
                            width: 100% !important;
                          }
                          .best-value-mobile {
                            display: flex !important;
                            justify-content: center !important;
                            align-items: center !important;
                            width: 100% !important;
                          }
                          .card.shadow.h-100 {
                            min-height: 100%;
                            max-height: 100%;
                            display: flex;
                            flex-direction: column;
                            width: 100% !important;
                          }
                          .card-img-top {
                            height: 140px !important;
                            object-fit: cover !important;
                            width: 100% !important;
                          }
                        }
                        @media (max-width: 767px) {
                          .row.g-4 {
                            gap: 0 !important;
                          }
                          .card.shadow.h-100 {
                            min-height: 370px !important;
                            max-height: 370px !important;
                          }
                        }
                    `}</style>
                </div>
            )}
            {/* SearchBar Section under Featured Rooms */}
            <div className="container">
                <div className="bg-secondary bg-opacity-25 rounded-4 p-2 p-md-4 mb-4 shadow-sm">
                    <SearchBar />
                </div>
            </div>
            <style>{`
                @media (max-width: 767px) {
                  .container {
                    padding-left: 0.5rem !important;
                    padding-right: 0.5rem !important;
                  }
                  .card {
                    border-radius: 14px !important;
                  }
                  .card-header {
                    font-size: 1.1rem !important;
                    padding: 0.75rem 0.5rem !important;
                  }
                  .card-body {
                    padding: 1rem 0.5rem !important;
                  }
                  .row.g-4 {
                    gap: 1.5rem 0 !important;
                  }
                  h2.fw-bold {
                    font-size: 1.5rem !important;
                    padding: 0.25rem 0 !important;
                  }
                  .list-unstyled {
                    font-size: 0.98rem !important;
                  }
                  .btn-gradient-primary {
                    font-size: 1rem !important;
                    padding: 0.5rem 1.2rem !important;
                  }
                }
            `}</style>
            <div style={{ padding: "2rem", background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)", borderRadius: 32, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} className="additional-accommodations-section">
                <h2 className="mb-5 text-center additional-accommodations-title" style={{
                    fontFamily: "'Roboto Slab', serif",
                    fontWeight: 900,
                    color: "#0d6efd",
                    letterSpacing: 2,
                    fontSize: "2.7rem",
                    textShadow: "0 2px 8px #b2eaff, 0 1px 0 #fff",
                    background: "none",
                    WebkitBackgroundClip: "unset",
                    WebkitTextFillColor: "unset",
                    filter: "none",
                    borderRadius: 12,
                    padding: "0.5rem 0"
                }}>
                    Additional Accommodations
                </h2>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {rooms.map((room, idx) => {
                        const typeName = room.room_types?.name;
                        const typeDetails = typeName ? roomTypeDetails[typeName] : null;
                        const imageLeft = idx % 2 === 0;
                        return (
                            <li
                                key={room.id}
                                className="mb-5 additional-accommodations-card"
                                style={{
                                    border: "none",
                                    borderRadius: "32px",
                                    background: room.is_active ? "rgba(255,255,255,0.98)" : "#f8d7da",
                                    cursor: room.is_active ? "pointer" : "not-allowed",
                                    opacity: room.is_active ? 1 : 0.6,
                                    display: "flex",
                                    flexDirection: imageLeft ? "row" : "row-reverse",
                                    alignItems: "stretch",
                                    overflow: "hidden",
                                    minHeight: 260,
                                    boxShadow: "0 8px 32px rgba(13,110,253,0.10), 0 2px 8px rgba(0,0,0,0.04)",
                                    position: "relative",
                                    transition: "box-shadow 0.2s, transform 0.2s",
                                    marginBottom: 40
                                }}
                                onClick={() => room.is_active && handleRoomClick(room)}
                            >
                                <img
                                    src={getRoomImage(room)}
                                    alt={typeName ?? "Room"}
                                    className="additional-accommodations-img"
                                    style={{
                                        width: 340,
                                        height: 240,
                                        objectFit: "cover",
                                        borderRadius: imageLeft ? "32px 0 120px 32px" : "0 32px 32px 120px",
                                        marginLeft: imageLeft ? 0 : 0,
                                        marginRight: imageLeft ? "2.5rem" : 0,
                                        marginLeft: !imageLeft ? "2.5rem" : 0,
                                        boxShadow: imageLeft
                                            ? "12px 0 32px rgba(13,110,253,0.13)"
                                            : "-12px 0 32px rgba(13,110,253,0.13)",
                                        transition: "transform 0.2s",
                                        transform: room.is_active ? "scale(1.06) rotate(-2deg)" : "scale(1)"
                                    }}
                                />
                                <div className="p-4 d-flex flex-column justify-content-center additional-accommodations-body" style={{ flex: 1, minWidth: 0 }}>
                                    <div className="d-flex align-items-center mb-2 flex-wrap">
                                        <h3
                                            className="mb-0"
                                            style={{
                                                fontFamily: "'Roboto Slab', serif",
                                                fontSize: "1.7rem",
                                                fontWeight: 800,
                                                color: "#0d6efd",
                                                letterSpacing: 0.5,
                                                wordBreak: 'break-word',
                                                flex: 1
                                            }}
                                        >
                                            Room {room.room_number}
                                        </h3>
                                        <span className="badge bg-info text-dark ms-3" style={{ fontSize: 16 }}>{typeName ?? "Unknown Type"}</span>
                                        {!room.is_active && (
                                            <span className="badge bg-danger ms-2" style={{ fontSize: 16 }}>Not Available</span>
                                        )}
                                    </div>
                                    <div className="mb-2 fs-5">
                                        <span className="fw-bold text-success">
                                            {typeDetails
                                                ? `$${typeDetails.base_price_per_night}`
                                                : <Spinner />}
                                        </span>
                                        <span className="text-muted ms-1">/ night</span>
                                    </div>
                                    <div className="mb-2 fs-6">
                                        <i className="bi bi-people-fill me-1 text-primary"></i>
                                        <strong>Max Occupancy:</strong>{" "}
                                        {typeDetails
                                            ? typeDetails.max_occupancy
                                            : <Spinner />}
                                    </div>
                                    <div className="mb-2 fs-6" style={{ wordBreak: 'break-word' }}>
                                        <i className="bi bi-stars me-1 text-warning"></i>
                                        <strong>Amenities:</strong>{" "}
                                        {typeDetails
                                            ? (typeDetails.amenities?.join(", ") || "N/A")
                                            : <Spinner />}
                                    </div>
                                    <div className="mt-3 w-100 d-flex justify-content-center">
                                        <button
                                            className="btn btn-gradient-primary btn-lg px-4 shadow-sm ehvr-btn-wave"
                                            style={{
                                                background: room.is_active ? "linear-gradient(90deg,#0d6efd 0%,#00bcd4 100%)" : undefined,
                                                color: room.is_active ? "#fff" : undefined,
                                                border: "none",
                                                fontWeight: 700,
                                                fontSize: 18,
                                                opacity: room.is_active ? 1 : 0.7,
                                                width: '100%',
                                                minWidth: 120,
                                                maxWidth: 260
                                            }}
                                            disabled={!room.is_active}
                                            tabIndex={-1}
                                            onClick={e => {
                                                e.stopPropagation();
                                                if (room.is_active) handleRoomClick(room);
                                            }}
                                        >
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <style>{`
                @media (max-width: 767px) {
                  .additional-accommodations-section {
                    padding: 0.7rem !important;
                    border-radius: 16px !important;
                  }
                  .additional-accommodations-title {
                    font-size: 1.2rem !important;
                    padding: 0.25rem 0 !important;
                    word-break: break-word !important;
                  }
                  .additional-accommodations-card {
                    flex-direction: column !important;
                    align-items: stretch !important;
                    min-height: unset !important;
                    margin-bottom: 1.5rem !important;
                    border-radius: 16px !important;
                    box-shadow: 0 2px 8px rgba(13,110,253,0.10), 0 1px 4px rgba(0,0,0,0.04) !important;
                  }
                  .additional-accommodations-img {
                    width: 100% !important;
                    height: 160px !important;
                    border-radius: 16px 16px 0 0 !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    object-fit: cover !important;
                  }
                  .additional-accommodations-body {
                    padding: 1rem 0.5rem !important;
                  }
                  .additional-accommodations-body h3 {
                    font-size: 1.1rem !important;
                    word-break: break-word !important;
                  }
                  .additional-accommodations-body .fs-5,
                  .additional-accommodations-body .fs-6 {
                    font-size: 0.98rem !important;
                  }
                  .additional-accommodations-body .btn-gradient-primary {
                    font-size: 1rem !important;
                    padding: 0.5rem 1.2rem !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                  }
                }
            `}</style>
        </>
    );
};

export default ViewRooms;
