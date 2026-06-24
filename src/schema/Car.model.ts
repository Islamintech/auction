import mongoose, { Schema } from "mongoose";
import { CarStatus, CarBrand, CarColor, CarType, CarCondition, CarFuel, CarTransmission } from "../libs/enums/car.enum";

const carSchema = new Schema(
    {
        carStatus: {
            type: String,
            enum: Object.values(CarStatus),
            default: CarStatus.ONSALE,
        },

        carTitle: {
            type: String,
            required: true,
        },

        carVin: {
            type: String,
            trim: true,
            uppercase: true,
        },

        buyerName: {
            type: String,
            trim: true,
        },

        salePrice: {
            type: Number,
            min: 0,
        },

        saleDate: {
            type: Date,
        },

        carBrand: {
            type: String,
            enum: Object.values(CarBrand),
            required: true,
        },

        carMake: {
            type: String,
        },

        carModel: {
            type: String,
        },

        carType: {
            type: String,
            enum: Object.values(CarType),
            required: true,
            default: CarType.SEDAN,
        },

        carCondition: {
            type: String,
            enum: Object.values(CarCondition),
            required: true,
            default: CarCondition.INTACT,
        },

        carFuel: {
            type: String,
            enum: Object.values(CarFuel),
            default: CarFuel.PETROL,
        },

        carTransmission: {
            type: String,
            enum: Object.values(CarTransmission),
            default: CarTransmission.AUTO,
        },

        carYear: {
            type: Number,
            required: true,
        },

        carMileage: {
            type: Number,
            required: true,
        },

        carPrice: {
            type: String,
            required: true,
            trim: true,
        },

        carColor: {
            type: String,
            enum: Object.values(CarColor),
        },

        carDesc: {
            type: String,
        },

        carImages: {
            type: [String],
            default: [],
        },

        carViewCount: {
            type: Number,
            default: 0,
        },

        carLikeCount: {
            type: Number,
            default: 0,
        },

        carCommentCount: {
            type: Number,
            default: 0,
        },

        carConsultationCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

carSchema.index({ carBrand: 1, carYear: 1, carTitle: 1 }, { unique: true });
export default mongoose.model("Car", carSchema);
