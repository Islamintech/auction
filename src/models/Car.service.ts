import { shapeIntoMongooseObjectId } from '../libs/config';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { Car, CarInput, CarInquiry, CarUpdateInput } from '../libs/types/car';
import CarModel from '../schema/Car.model';
import { T } from '../libs/types/common';
import { ObjectId } from 'mongoose';
import ViewService from './View.service';
import { ViewInput } from '../libs/types/view';
import { ViewGroup } from '../libs/enums/view.enum';
import { CarStatus } from '../libs/enums/car.enum';
import PointService from './point.service';
import { PointAction } from '../libs/enums/point.enum';

class CarService {
    private readonly carModel;
    public viewService;
    public pointService;

    constructor() {
        this.carModel = CarModel;
        this.viewService = new ViewService();
        this.pointService = new PointService();
    }

    /** SPA */

    public async getCars(inquiry: CarInquiry): Promise<Car[]> {
        const match: T = { carStatus: CarStatus.ONSALE };

        if (inquiry.carBrand) match.carBrand = inquiry.carBrand;
        if (inquiry.search) match.carTitle = { $regex: new RegExp(inquiry.search, 'i') };
        if (inquiry.minPrice || inquiry.maxPrice) {
            match.carPrice = {};
            if (inquiry.minPrice) match.carPrice.$gte = inquiry.minPrice;
            if (inquiry.maxPrice) match.carPrice.$lte = inquiry.maxPrice;
        }
        if (inquiry.minYear || inquiry.maxYear) {
            match.carYear = {};
            if (inquiry.minYear) match.carYear.$gte = inquiry.minYear;
            if (inquiry.maxYear) match.carYear.$lte = inquiry.maxYear;
        }

        const sort: T = inquiry.order === 'carPrice'
            ? { [inquiry.order]: 1 }
            : { [inquiry.order]: -1 };

        const result = await this.carModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (inquiry.page * 1 - 1) * inquiry.limit },
                { $limit: inquiry.limit * 1 },
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    public async getCar(memberId: ObjectId | null, id: string): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        const result = await this.carModel
            .findOne({ _id: carId, carStatus: CarStatus.ONSALE })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (memberId) {
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: carId,
                viewGroup: ViewGroup.CAR,
            };

            const existView = await this.viewService.checkViewExistence(input);
            if (!existView) {
                await this.viewService.insertMemberView(input);
                await this.carModel
                    .findOneAndUpdate(
                        { _id: carId },
                        { $inc: { carViewCount: 1 } },
                        { new: true }
                    )
                    .exec();

                // +1 point — saves to history
                await this.pointService.awardPoints(
                    { _id: memberId } as any,
                    PointAction.VIEW_CAR,
                    carId
                );
            }
        }

        return result;
    }

    public async likeCar(memberId: ObjectId, id: string): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        const result = await this.carModel
            .findOneAndUpdate(
                { _id: carId, carStatus: CarStatus.ONSALE },
                { $inc: { carLikeCount: 1 } },
                { new: true }
            )
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        // +3 points — saves to history
        await this.pointService.awardPoints(
            { _id: memberId } as any,
            PointAction.LIKE_CAR,
            carId
        );

        return result;
    }

    public async commentCar(memberId: ObjectId, id: string, input: any): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        const result = await this.carModel
            .findOneAndUpdate(
                { _id: carId, carStatus: CarStatus.ONSALE },
                { $inc: { carCommentCount: 1 } },
                { new: true }
            )
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        // +5 points — saves to history
        await this.pointService.awardPoints(
            { _id: memberId } as any,
            PointAction.COMMENT_CAR,
            carId
        );

        return result;
    }

    /** SSR — Admin Panel */

    public async getAllCars(): Promise<Car[]> {
        const result = await this.carModel.find().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    public async createNewCar(input: CarInput): Promise<Car> {
        try {
            return await this.carModel.create(input);
        } catch (err) {
            console.log('Error, createNewCar:', err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
        }
    }

    public async updateChosenCar(id: string, input: CarUpdateInput): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);
        const result = await this.carModel
            .findOneAndUpdate({ _id: carId }, input, { new: true })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
        return result;
    }

    public async deleteChosenCar(id: string): Promise<Car> {
    const carId = shapeIntoMongooseObjectId(id);
    const result = await this.carModel
        .findByIdAndDelete({ _id: carId })
        .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
    return result;
    }
}

export default CarService;