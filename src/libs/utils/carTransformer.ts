import { CarCondition } from '../enums/car.enum';

export const toClientCar = (car: any) => {
    if (!car) return car;
    const c = typeof car.toObject === 'function' ? car.toObject() : car;
    const images: string[] = Array.isArray(c.carImages) ? c.carImages : [];
    return {
        id: String(c._id),
        title: c.carTitle,
        brand: c.carBrand,
        make: c.carMake,
        model: c.carModel,
        type: c.carType,
        condition: c.carCondition,
        category: c.carCondition === CarCondition.DAMAGED ? 'crashed' : 'ready',
        fuel: c.carFuel,
        trans: c.carTransmission,
        year: c.carYear,
        km: c.carMileage,
        price: c.carPrice,
        color: c.carColor,
        desc: c.carDesc,
        damage: c.carDamage,
        damageDesc: c.carDamageDesc,
        damagedParts: c.damagedParts || [],
        image: images[0] || null,
        images,
        status: c.carStatus,
        viewCount: c.carViewCount,
        likeCount: c.carLikeCount,
        commentCount: c.carCommentCount,
        consultationCount: c.carConsultationCount,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
};

export const toClientCars = (cars: any[]) => (cars || []).map(toClientCar);
