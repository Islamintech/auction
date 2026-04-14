import mongoose, { Schema } from "mongoose";
import { CarStatus, CarBrand, CarColor } from "../libs/enums/car.enum";

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

        carBrand: {
            type: String,
            enum: Object.values(CarBrand),
            required: true,
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
            type: Number,
            required: true,
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