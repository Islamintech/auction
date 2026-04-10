import MemberModel from "../schema/Member.model";
import { LoginInput, Member, MemberInput, MemberUpdateInput } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { MemberStatus, MemberType } from "../libs/enums/member.enum";
import * as bcrypt from "bcryptjs";
import { shapeIntoMongooseObjectId } from "../libs/config";


class MemberService {
    static addUserPoints(member: Member, arg1: number) {
        throw new Error("Method not implemented.");
    }
    private readonly memberModel;

    constructor() {
        this.memberModel = MemberModel;
    }

    /**SPA*/
    public async getRestaurant(): Promise<Member>{
        const result = await this.memberModel
            .findOne({memberType: MemberType.RESTAURANT})
            .exec();
            if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
            return result;
        }

    public async signup(input: MemberInput): Promise<Member> {
        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            result.memberPassword = "";
            return result.toJSON();
        } catch (err) {
            console.error("Error, model;signup", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }

    public async login(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne({ memberNick: input.memberNick, memberStatus: {$ne: MemberStatus.DELETE} }, //Filter
                { _id: 1, memberNick: 1, memberPassword: 1, memberStatus: 1 } //Projection
            )
            .exec();
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
            else if (member.memberStatus === MemberStatus.BLOCK){
                throw new Errors(HttpCode.FORBIDDEN, Message.BLOCKED_USER);
            }

        const isMatch = await bcrypt.compare(
            input.memberPassword,
            member.memberPassword
        );
        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHIRIZED, Message.WORNG_PASSWORD);
        }
        return await this.memberModel.findById(member._id).lean().exec();
    }

    public async getMemberDetail(member: Member): Promise<Member>{
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
            .findOne({_id: memberId, memberStatus: MemberStatus.ACTIVE})
            .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }


    public async updateMember(
        member: Member, 
        input: MemberUpdateInput
    ): Promise<Member>{
        const memberId = shapeIntoMongooseObjectId(member._id);
        const result = await this.memberModel
        .findByIdAndUpdate({_id: memberId}, input, {new: true})
        .exec();
        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);
        return result;
    }

    public async getTopUsers(): Promise<Member[]>{
        const result =  await this.memberModel
            .find({memberStatus: MemberStatus.ACTIVE,
                    memberPoints: { $gte: 1},
            })
                .sort({memberPoints: 'asc'})
                .limit(4)
                .exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;    
    }

    public async addUserPoints(member: Member, point: number): Promise<Member>{
        const memberId =  shapeIntoMongooseObjectId(member._id);

        return await this.memberModel
        .findOneAndUpdate(
            {
            _id: memberId, 
            memberType: MemberType.USER,
            memberStatus: MemberStatus.ACTIVE
            },
            {$inc: {memberPoints: point} },
            {new: true}    
        )
        .exec();
    }


    /** SSR */

    public async processSignup(input: MemberInput): Promise<Member> { //define
        const exist = await this.memberModel
            .findOne({ memberType: MemberType.RESTAURANT })
            .exec();
        if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);

        const salt = await bcrypt.genSalt();
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            // result.memberPassword = "";
            return result;
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
        }
    }

    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne({ memberNick: input.memberNick, memberType: MemberType.RESTAURANT }, //Filter
                     { _id: 1, memberNick: 1, memberPassword: 1 }) //Projection
            .exec();
        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);

        const isMatch = await bcrypt.compare(
            input.memberPassword,
            member.memberPassword
        );
        //const isMatch = input.memberPassword === member.memberPassword;

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHIRIZED, Message.WORNG_PASSWORD);
        }
        return await this.memberModel.findById(member._id).exec();
    }

    public async getUsers(): Promise<Member[]>{
        const result = await this.memberModel
        .find({memberType: MemberType.USER})
        .exec();

        if(!result.length) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async updateChosenUser(input: MemberUpdateInput): Promise<Member>{
        input._id = shapeIntoMongooseObjectId(input._id)
        const result = await this.memberModel
        .findByIdAndUpdate(
            {_id: input._id}, //Filter
            input,            //Update
            {new: true, runValidators: true}) //Options
        .exec();

        if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATED_FAILED);

        return result;
    }
}

export default MemberService;