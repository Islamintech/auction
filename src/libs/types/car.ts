import { ObjectId } from "mongoose";
import { CarBrand, CarColor, CarStatus } from "../enums/car.enum";

export interface Car {
    _id: ObjectId;
    carStatus: CarStatus;
    carTitle: string;
    carBrand: CarBrand;
    carYear: number;
    carMileage: number;
    carPrice: number;
    carColor?: CarColor;
    carDesc?: string;
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
    carBrand: CarBrand;
    carYear: number;
    carMileage: number;
    carPrice: number;
    carColor?: CarColor;
    carDesc?: string;
    carImages: string[];
}

export interface CarUpdateInput {
    _id: ObjectId;
    carStatus?: CarStatus;
    carTitle?: string;
    carBrand?: CarBrand;
    carYear?: number;
    carMileage?: number;
    carPrice?: number;
    carColor?: CarColor;
    carDesc?: string;
    carImages?: string[];
}

export interface CarInquiry {
    order: string;
    page: number;
    limit: number;
    carBrand?: CarBrand;
    carStatus?: CarStatus;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
}