import express from 'express';
import path from 'path';
import router from './router';
import routerAdmin from './router-admin';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { MORGAN_FORMAT } from './libs/config';
import session from 'express-session';
import ConnectMongoDB from 'connect-mongodb-session';
import { T } from './libs/types/common';
import cors from 'cors';

//TCP2
const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
    uri: String(process.env.MONGO_URL),
    collection: "sessions"
})

/** 1 - Entrance **/
const app = express();
app.use(express.static(path.join(__dirname, 'public'))); // bu public ichidagi filelarni browserga yuborib beruvchi middleware
app.use("/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true })); //Traditional API lar uchun xizmat qiladigan middleware, fornt enddan POST/PUT methodli fatalarni qabul qilib oladi
app.use(express.json()); //REST API uchun xizmat qiladi ya'ni REST API odatda JSON file yuboradi shuni qabul qilib oluvchi middleware
app.use(cors({credentials: true, origin: true}));
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT)); //HTTP request logger, serverga kelgan har bir so'rovni konsolda ko'rsatadi
 
/** 2 - Sessions **/
app.use(
    session({
        secret: String(process.env.SESSION_SECRET),
        cookie: {
            maxAge: 1000 * 3600 * 6  //6h
        },
        store: store,
        resave: true,
        saveUninitialized: true
    })
);

app.use(function (req, res, next) {
    const sessionInstance = req.session as T;
    res.locals.member = sessionInstance.member;
    next();
})


/** 3 - Views **/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/** 4 - Routers **/
app.use('/admin', routerAdmin); //SSR:  
app.use('/', router);           //SPA:   

export default app; 