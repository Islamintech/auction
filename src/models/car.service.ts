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
import PointService from './Point.service';
import { PointAction } from '../libs/enums/point.enum';
import LikeService from './Like.service';
import { LikeInput } from '../libs/types/like';
import { LikeGroup } from '../libs/enums/like.enum';

class CarService {
    private readonly carModel;
    public viewService;
    public pointService;
    public likeService;

    constructor() {
        this.carModel = CarModel;
        this.viewService = new ViewService();
        this.pointService = new PointService();
        this.likeService = new LikeService();
    }

    /** SPA */

    public async getCars(inquiry: CarInquiry): Promise<Car[]> {
        const match: T = { carStatus: CarStatus.ONSALE };

        if (inquiry.carBrand) match.carBrand = inquiry.carBrand;
        if (inquiry.search) match.carTitle = { $regex: new RegExp(inquiry.search, 'i') };

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

                await this.pointService.awardPoints(
                    { _id: memberId } as any,
                    PointAction.VIEW_CAR,
                    carId
                );
            }

            // 👇 Attach myFavorite so React heart reflects server state
            const likeInput: LikeInput = {
                memberId,
                likeRefId: carId,
                likeGroup: LikeGroup.CAR,
            };
            const exists = await this.likeService.checkLikeExistence(likeInput);
            (result as any).myFavorite = exists.length > 0;
        }

        const CommentModel = (await import('../schema/Comment.model')).default;
        const comments = await CommentModel
            .find({ commentRefId: carId, commentGroup: 'CAR' })
            .sort({ createdAt: -1 })
            .populate('memberId', 'memberNick memberImage')
            .lean()
            .exec();

        (result as any).comments = comments.map((c: any) => ({
            _id: c._id,
            commentContent: c.commentContent,
            createdAt: c.createdAt,
            memberId: c.memberId?._id,
            memberNick: c.memberId?.memberNick,
            memberImage: c.memberId?.memberImage,
        }));

        return result;
    }

    public async likeCar(memberId: ObjectId, id: string): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        const target = await this.carModel
            .findOne({ _id: carId, carStatus: CarStatus.ONSALE })
            .exec();
        if (!target) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        const likeInput: LikeInput = {
            memberId,
            likeRefId: carId,
            likeGroup: LikeGroup.CAR,
        };
        const modifier = await this.likeService.toggleLike(likeInput);

        const result = await this.carModel
            .findByIdAndUpdate(
                carId,
                { $inc: { carLikeCount: modifier } },
                { new: true }
            )
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

        if (modifier === 1) {
            await this.pointService.awardPoints(
                { _id: memberId } as any,
                PointAction.LIKE_CAR,
                carId
            );
        }

        // 👇 Bonus: immediately reflect new favorite state in response
        (result as any).myFavorite = modifier === 1;

        return result;
    }

    public async commentCar(memberId: ObjectId, id: string, input: any): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        const CommentModel = (await import('../schema/Comment.model')).default;
        await CommentModel.create({
            memberId,
            commentRefId: carId,
            commentGroup: 'CAR',
            commentContent: input.commentContent,
        });

        const result = await this.carModel
            .findOneAndUpdate(
                { _id: carId, carStatus: CarStatus.ONSALE },
                { $inc: { carCommentCount: 1 } },
                { new: true }
            )
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        await this.pointService.awardPoints(
            { _id: memberId } as any,
            PointAction.COMMENT_CAR,
            carId
        );

        return result;
    }

    public async getCarByVin(vin: string): Promise<Car | null> {
        const normalized = vin.trim().toUpperCase();
        if (!normalized) return null;
        return await this.carModel.findOne({ carVin: normalized }).exec();
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

        const update: T = { ...input };
        if (input.carStatus && input.carStatus !== CarStatus.SOLD) {
            // Clear sale details when a car is no longer marked as sold.
            delete update.buyerName;
            delete update.salePrice;
            delete update.saleDate;
            update.$unset = { buyerName: '', salePrice: '', saleDate: '' };
        }

        const result = await this.carModel
            .findOneAndUpdate({ _id: carId }, update, { new: true })
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
