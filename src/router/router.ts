import express from "express";
const router = express.Router();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {UserModel} from '../schemas/user.model';
import {ProductModel} from '../schemas/product.model';
import {auth} from '../middleware/auth';
import {secret} from "../middleware/auth";
router.use("/product", auth)
router.post("/user/register", async (req, res) => {
    try {
        const user = await UserModel.findOne({username: req.body.username});
        if (!user) {
            const passwordHash = await bcrypt.hash(req.body.password, 10);
            let userData = {
                username: req.body.username,
                password: passwordHash
            }

            const newUser = await UserModel.create(userData);
            res.json({user: newUser, code: 200})

        } else {
            res.json({err: "User exited"})
        }
    } catch (err) {
        res.json({err: err})
    }

});

router.post("/user/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({username: req.body.username});
        if (user) {
            const comparePass = await bcrypt.compare(req.body.password, user.password);
            if (!comparePass) {
                return Promise.reject({
                    code: 404,
                    message: "PASSWORD_NOT_VALID",
                }).catch(err=>{
                    res.json({err:err})
                });
            }
            let payload = {
                user_id: user["id"],
                username: user["username"],
            }

            const token = jwt.sign(payload, secret, {
                expiresIn: 36000,
            });
            return res.json({token: token, code: 200})
        } else {
            return res.json({err: 'Email has been used'});
        }

    } catch (err) {
        return res.json({err: err})
    }

});

router.post("/product/create", async (req, res) => {
    try {
        const product = await ProductModel.findOne({name: req.body.name});
        if (!product) {
            let productData = {
                name: req.body.name,
                price: req.body.price,
                category: req.body.category,
            }

            const productNew = await ProductModel.create(productData);
            res.json({product: productNew, code: 200})
        } else {
            res.json({err: "Product exited"})
        }
    } catch (err) {
        res.json({err: err})

    }

});
export default router