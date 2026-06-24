import { ObjectId } from "mongoose";
import { CarBrand, CarColor, CarCondition, CarFuel, CarStatus, CarTransmission, CarType } from "../enums/car.enum";

export interface Car {
    _id: ObjectId;
    carStatus: CarStatus;
    carTitle: string;
    carVin?: string;
    buyerName?: string;
    salePrice?: number;
    saleDate?: Date;
    carBrand: CarBrand;
    carMake?: string;
    carModel?: string;
    carType: CarType;
    carCondition: CarCondition;
    carFuel?: CarFuel;
    carTransmission?: CarTransmission;
    carYear: number;
    carMileage: number;
    carPrice: number;
    carColor?: CarColor;
    carDesc?: string;
    carDamage?: string;
    carDamageDesc?: string;
    carImages: string[];
    carViewCount: number;
    carLikeCount: number;
    carCommentCount: number;
    carConsultationCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CarInput {
    carStatus?: CarStatus;
    carTitle: string;
    carVin?: string;
    carBrand: CarBrand;
    carMake?: string;
    carModel?: string;
    carType: CarType;
    carCondition: CarCondition;
    carFuel?: CarFuel;
    carTransmission?: CarTransmission;
    carYear: number;
    carMileage: number;
    carPrice: number;
    carColor?: CarColor;
    carDesc?: string;
    carDamage?: string;
    carDamageDesc?: string;
    carImages: string[];
}

export interface CarUpdateInput {
    _id: ObjectId;
    carStatus?: CarStatus;
    carTitle?: string;
    carVin?: string;
    buyerName?: string;
    salePrice?: number;
    saleDate?: Date | string;
    carBrand?: CarBrand;
    carMake?: string;
    carModel?: string;
    carType?: CarType;
    carCondition?: CarCondition;
    carFuel?: CarFuel;
    carTransmission?: CarTransmission;
    carYear?: number;
    carMileage?: number;
    carPrice?: number;
    carColor?: CarColor;
    carDesc?: string;
    carDamage?: string;
    carDamageDesc?: string;
    carImages?: string[];
}

export interface CarInquiry {
    order: string;
    page: number;
    limit: number;
    carBrand?: CarBrand;
    carType?: CarType;
    carCondition?: CarCondition;
    carStatus?: CarStatus;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
}
