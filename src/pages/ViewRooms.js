import React from "react";
import { useLocation, useNavigate } from "react-router-dom";


const ViewRooms = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state;

    if (!state || !state.rooms) {
        return <div>No rooms data provided.</div>;
    }

    const handleRoomClick = (room) => {
        navigate(`/rooms/${room.id}`, { state: { room } });
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Available Rooms</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {state.rooms.map((room) => (
                    <li
                        key={room.id}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            marginBottom: "1rem",
                            padding: "1rem",
                            background: room.is_active ? "#fff" : "#f8d7da",
                            cursor: room.is_active ? "pointer" : "not-allowed",
                            opacity: room.is_active ? 1 : 0.6,
                        }}
                        onClick={() => room.is_active && handleRoomClick(room)}
                    >
                        <h3>
                            Room {room.room_number} - {room.room_type?.name ?? "Unknown Type"}
                        </h3>
                        <p>
                            <strong>Price:</strong> ${room.room_type?.base_price_per_night ?? "N/A"} / night
                        </p>
                        <p>
                            <strong>Max Occupancy:</strong> {room.room_type?.max_occupancy ?? "N/A"}
                        </p>
                        <p>
                            <strong>Amenities:</strong> {room.room_type?.amenities?.join(", ") ?? "N/A"}
                        </p>
                        {!room.is_active && (
                            <span style={{ color: "#721c24" }}>Not Available</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ViewRooms;
