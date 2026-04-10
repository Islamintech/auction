import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from '../models/product.service';
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";

const productService = new ProductService()

const productController: T = {};

/** SPA **/
productController.getProducts = async (req: Request, res: Response) => {
    try {
        console.log("getProducts");
        const {page, limit, order, productCollection, search} = req.query; 
        const inquiry: ProductInquiry = {
            order: String(order),
            page: Number(page),
            limit: Number(limit),
        };
        if(productCollection){
            inquiry.productCollection = productCollection as ProductCollection;
        }
        if(search) inquiry.search = String(search);
        
        const result = await productService.getProducts(inquiry);
        console.log("result", result);
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getProducts:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
}

productController.getProduct = async (req: ExtendedRequest, res: Response)=>{
    try {
        console.log("getProduct");
        console.log("ewfewfewfew" ,req.params);
        console.log("req.member", req.member);
        const {id} = req.params;
        const memberId = req.member?._id ?? null,
            result = await productService.getProduct(memberId, String(id));


        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log("Error, getProduct:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
}

/** SSR **/
productController.getAllProducts = async (req: Request, res: Response) => {
    try {
        const data = await productService.getAllProducts();
        res.render("products", {products: data});
    } catch (err) {
        console.log("Error, productController:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
    try {
        if(!req.files?.length) 
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATED_FAILED);
        
        const data: ProductInput = req.body;
        data.productImages = req.files?.map((ele)=>{
            return ele.path.replace(/\\/g, '/'); //Regex => Regular Experssion
        })

        await productService.createNewProduct(data);

        res.send(
            `<script>alert("Successful creation"); window.location.replace('/admin/product/all')</script>`
        );
    } catch (err) {
        console.log("Error, createNewProduct:", err);
        const message = 
            err instanceof Errors ? err.message: Message.SOMETHING_WENT_WRONG;
       res.send(
            `<script>alert("${message}"); window.location.replace('admin/product/all')</script>`
        );
    }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
    
        const result = await productService.updateChosenProduct(id as string, req.body);
        

        res.status(HttpCode.OK).json({data: result});
    } catch (err) {
        console.log("Error, updateChosenProduct:", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};



export default productController;