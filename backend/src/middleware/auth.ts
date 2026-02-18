import jwt from "jsonwebtoken";
import { Request, Response, NextFunction} from "express";

const JWT_SECRET = process.env.JWT_SECRET;

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const authenticationToken = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
        try {
            const authHeader = req.headers["authorization"];

            if (!authHeader?.startsWith("Bearer ")) {
                return res.status(401).json({ message: "Invalid authorization header format" });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(401)
                .json({message: "Not authorized, no token"})
            };

            if (!JWT_SECRET) {
                return res.status(500)
                .json({ message: "JWT secret not configured" });
            }

            const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

            if (!decoded.userId) {
                return res.status(401).json({ message: "Invalid token payload" });
            }
              
            req.userId = decoded.userId;
            next();

        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json({ message: "Token expired" });
            }

            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ message: "Invalid token" });
            }


            console.error("Austhentication Error:", error);
            res.status(500)
            .json({error: "Server error during authentication"})
            
        }
}


export default authenticationToken