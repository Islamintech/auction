export enum HttpCode {
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHIRIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATED_FAILED = "Create is failed!",
    UPDATED_FAILED = "Update is failed!",
    TOKEN_CREATION_FAILED = "Token creation error",
    NO_MEMBER_NICK = "No member with that nickname!",
    USED_NICK_PHONE = "This nickname or phone is already in use!",
    WORNG_PASSWORD = "Wrong password!",
    NOT_AUTHENTICATED = "You are not authenticated, please login first",
    BLOCKED_USER = "Your account has been banned, please contact Auction.uz support",
    UNAUTHORIZED_ACTION = "You are not authorized to perform this action",
    FILE_NOT_FOUND = "No file was uploaded",
    ADMIN_EXIST = "Admin account already exists!",
}

class Errors extends Error {
    public code: HttpCode;
    public message: Message;

    static standart = {
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG,
    };

    constructor(statusCode: HttpCode, statusMessage: Message) {
        super();
        this.code = statusCode;
        this.message = statusMessage;
    }
}

export default Errors;