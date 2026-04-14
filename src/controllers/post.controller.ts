import { Request, Response } from 'express';
import Errors, { HttpCode, Message } from '../libs/Errors';
import { T } from '../libs/types/common';
import PostService from '../models/Post.service';
import { ExtendedRequest } from '../libs/types/member';
import { PostInput, PostInquiry } from '../libs/types/post';
import { PostType } from '../libs/enums/post.enum';


const postService = new PostService();
const postController: T = {};

/** SPA */

postController.getPosts = async (req: Request, res: Response) => {
    try {
        console.log('getPosts');
        const { page, limit, order, postType, search } = req.query;

        const inquiry: PostInquiry = {
            order: String(order),
            page: Number(page),
            limit: Number(limit),
        };

        if (postType) inquiry.postType = postType as PostType;
        if (search) inquiry.search = String(search);

        const result = await postService.getPosts(inquiry);
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log('Error, getPosts:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

postController.getPost = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('getPost');
        const { id } = req.params;
        const memberId = req.member?._id ?? null;
        const result = await postService.getPost(memberId, String(id));
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log('Error, getPost:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

postController.createPost = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('createPost');
        const input: PostInput = req.body;
        const result = await postService.createPost(req.member._id, input);
        res.status(HttpCode.CREATED).json(result);
    } catch (err) {
        console.log('Error, createPost:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

postController.likePost = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('likePost');
        const { id } = req.params;
        const result = await postService.likePost(req.member._id, String(id));
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log('Error, likePost:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

postController.commentPost = async (req: ExtendedRequest, res: Response) => {
    try {
        console.log('commentPost');
        const { id } = req.params;
        const result = await postService.commentPost(req.member._id, String(id), req.body);
        res.status(HttpCode.OK).json(result);
    } catch (err) {
        console.log('Error, commentPost:', err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart.message);
    }
};

export default postController;