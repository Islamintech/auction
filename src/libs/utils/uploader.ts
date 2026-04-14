import path from 'path';
import multer from 'multer';
import { v4 } from 'uuid';
import fs from 'fs';

function getTargetImageStore(address: string) {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = `./uploads/${address}`;
            fs.mkdirSync(dir, { recursive: true }); // ← this is what was missing
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const extension = path.parse(file.originalname).ext;
            const random_name = v4() + extension;
            cb(null, random_name);
        },
    });
}

const makeUploader = (address: string) => {
    const storage = getTargetImageStore(address);
    return multer({ storage: storage });
};

export default makeUploader;






/*
const product_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/products");
    },
    filename: function (req, file, cb) {
        console.log(file);
        const extension = path.parse(file.originalname).ext;
        const random_name = v4() + extension;
        cb(null, random_name);
    },
});

export const uploadProductImage = multer({ storage: product_storage });
*/