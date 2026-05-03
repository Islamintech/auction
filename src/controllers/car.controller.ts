import { Request, Response } from 'express';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { T } from '../libs/types/common';
import CarService from '../models/car.service';
import { AdminRequest, ExtendedRequest } from '../libs/types/member';
import { CarInput, CarInquiry, CarUpdateInput } from '../libs/types/car';
import { CarBrand, CarColor, CarCondition, CarFuel, CarStatus, CarTransmission, CarType } from '../libs/enums/car.enum';
import { toClientCar, toClientCars } from '../libs/utils/carTransformer';

const carService = new CarService();
const carController: T = {};

/** SPA **/
carController.getCars = async (req: Request, res: Response) => {
    try {
        console.log('getCars');
        const { page, limit, order, carBrand, search, minPrice, maxPrice, minYear, maxYear } = req.query;

        const inquiry: CarInquiry = {
            order: String(order),
            page: Number(page),
            limit: Number(limit),
        };

        if (carBrand) inquiry.carBrand = carBrand as CarBrand;
        if (search) inquiry.search = String(search);
        if (minPrice) inquiry.minPrice = Number(minPrice);
        if (maxPrice) inquiry.maxPrice = Number(maxPrice);
        if (minYear) inquiry.minYear = Number(minYear);
        if (maxYear) inquiry.maxYear = Number(maxYear);

        const result = await carService.getCars(inquiry);
        res.status(HttpCode.OK).json(toClientCars(result));
    } catch (err) {
        console.log('Error, getCars:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

carController.getCar = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('getCar');
        const { id } = req.params;
        const memberId = req.member?._id ?? null;
        const result = await carService.getCar(memberId, String(id));
        res.status(HttpCode.OK).json(toClientCar(result));
    } catch (err) {
        console.log('Error, getCar:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

carController.likeCar = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('likeCar');
        const { id } = req.params;
        const result = await carService.likeCar(req.member._id, String(id));
        res.status(HttpCode.OK).json(toClientCar(result));
    } catch (err) {
        console.log('Error, likeCar:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

carController.commentCar = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('commentCar');
        const { id } = req.params;
        const result = await carService.commentCar(req.member._id, String(id), req.body);
        res.status(HttpCode.OK).json(toClientCar(result));
    } catch (err) {
        console.log('Error, commentCar:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

/** SSR **/
carController.getAllCars = async (req: Request, res: Response) => {
    try {
        const data = await carService.getAllCars();
        res.render('cars', {
            cars: data,
            CarBrand: Object.values(CarBrand),
            CarColor: Object.values(CarColor),
            CarStatus: Object.values(CarStatus),
            CarType: Object.values(CarType),
            CarCondition: Object.values(CarCondition),
            CarFuel: Object.values(CarFuel),
            CarTransmission: Object.values(CarTransmission),
        });
    } catch (err) {
        console.log('Error, getAllCars:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

carController.createNewCar = async (req: AdminRequest, res: Response) => {
    try {
        console.log('createNewCar');
        if (!req.files?.length)
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATED_FAILED);

        const data: CarInput = req.body;
        data.carImages = req.files?.map((ele) => {
            return ele.path.replace(/\\/g, '/');
        });

        const partNames: string[] = []
            .concat(req.body.damagedPartName || [])
            .filter((s: string) => s && s.trim().length > 0);
        const partPrices: string[] = [].concat(req.body.damagedPartPrice || req.body.damagedPartCost || []);
        const partOems: string[] = [].concat(req.body.damagedPartOem || []);
        const partShips: string[] = [].concat(req.body.damagedPartShip || []);

        if (data.carCondition === CarCondition.DAMAGED && partNames.length > 0) {
            data.damagedParts = partNames.map((name: string, i: number) => ({
                name: String(name).trim(),
                price: Number(partPrices[i]) || 0,
                oem: partOems[i] ? String(partOems[i]).trim() : undefined,
                ship: Number(partShips[i]) || 0,
            }));
        } else {
            data.damagedParts = [];
        }

        await carService.createNewCar(data);

        res.send(
            `<script>alert("Car created successfully"); window.location.replace('/admin/car/all')</script>`
        );
    } catch (err) {
        console.log('Error, createNewCar:', err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script>alert("${message}"); window.location.replace('/admin/car/all')</script>`
        );
    }
};

carController.updateChosenCar = async (req: Request, res: Response) => {
    try {
        console.log('updateChosenCar');
        const { id } = req.params;
        const input: CarUpdateInput = req.body;
        const result = await carService.updateChosenCar(String(id), input);
        res.status(HttpCode.OK).json({ data: result });
    } catch (err) {
        console.log('Error, updateChosenCar:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

carController.deleteChosenCar = async (req: Request, res: Response) => {
    try {
        console.log('deleteChosenCar');
        const { id } = req.params;
        const result = await carService.deleteChosenCar(String(id));
        res.status(HttpCode.OK).json({ data: result });
    } catch (err) {
        console.log('Error, deleteChosenCar:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

export default carController;
