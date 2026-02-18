import { Router } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/register", async (req, res) => {
    try {
        const {email, password} = req.body;

        //Basic validation
        if (!email || !password) {
            return res.status(400).json({error: "Email and password required"});
        }

        if (password.length < 6) {
            return res.status(400).json({error: "Password must be 6 chars long"});
        }

        //check if user exists in db
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({error: "Email already registered"});
        }

        //Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        //Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash
            },
        });

        return res.status(201).json({
            message: "User created",
            userId: user.id
        });
        
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(409).json({error: "Email already registered"});
        }
        console.error(error);
        return res.status(500).json({error: "Something went wrong on server side"});
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        //Basic validation
        if (!email || !password) {
            res.status(400).json({error: "Email and password required"});
        }

        if (password.length < 6) {
            return res.status(400).json({error: "Password must be 6 chars long"});
        }

        const user = await prisma.user.findUnique({ where: {email}});

        if (!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordMatching) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        const token = jwt.sign(
            {userId: user.id},
            process.env.JWT_SECRET as string,
            {expiresIn: "1hr"}
        );

        return res.status(200).json({
            message: "Login successful", 
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Something went wrong on server side"})
    }
})

export default router;