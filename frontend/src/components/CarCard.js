import React from "react";
import { Link } from "react-router-dom";

const CarCard = ({ car }) => {
  return (
    <div className="card m-2" style={{ width: "18rem" }}>
      <img
        src={car.image || "https://via.placeholder.com/150"}
        className="card-img-top"
        alt={car.model}
      />
      <div className="card-body">
        <h5 className="card-title">{car.brand} {car.model}</h5>
        <p className="card-text">
          Price per day: ₹{car.pricePerDay} <br />
          Type: {car.type} <br />
          Location: {car.location}
        </p>
        <Link to={`/car/${car._id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CarCard;
