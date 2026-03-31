package com.carrental.service;

import com.carrental.dto.CarDto;
import com.carrental.model.Car;
import com.carrental.repository.CarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarService {

    @Autowired
    private CarRepository carRepository;

    public Car createCar(CarDto carDto) {
        if (carRepository.findByPlateNumber(carDto.getPlateNumber()).isPresent()) {
            throw new RuntimeException("Car with this plate number already exists!");
        }

        Car car = new Car();
        car.setOwnerId(carDto.getOwnerId());
        car.setName(carDto.getName());
        car.setPlateNumber(carDto.getPlateNumber().toUpperCase());
        car.setType(carDto.getType());
        car.setTransmission(carDto.getTransmission());
        car.setFuel(carDto.getFuel());
        car.setSeats(carDto.getSeats());
        car.setPrice(carDto.getPrice());
        car.setLocation(carDto.getLocation());
        car.setDescription(carDto.getDescription());
        car.setFeatures(carDto.getFeatures());
        car.setImages(carDto.getImages());

        return carRepository.save(car);
    }

    public List<Car> getAllCars() {
        return carRepository.findAll();
    }

    public Car getCarById(String id) {
        return carRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Car not found!"));
    }

    public Car updateCarStatus(String id, boolean isAvailable) {
        Car car = getCarById(id);
        car.setAvailable(isAvailable);
        return carRepository.save(car);
    }
}
