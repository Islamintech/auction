import { ObjectId } from "mongoose";
import { CarBrand, CarColor, CarCondition, CarFuel, CarStatus, CarTransmission, CarType } from "../enums/car.enum";

export interface DamagedPart {
    name: string;
    price: number;
    oem?: string;
    ship?: number;
}

export interface Car {
    _id: ObjectId;
    carStatus: CarStatus;
    carTitle: string;
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
    damagedParts: DamagedPart[];
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
    damagedParts?: DamagedPart[];
}

export interface CarUpdateInput {
    _id: ObjectId;
    carStatus?: CarStatus;
    carTitle?: string;
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
    damagedParts?: DamagedPart[];
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
