import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";



export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized access");
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCEES_TOKEN_SECRET);

        const user = await User.findByID(decodedToken?._id).select("-password -refreshToken ");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }

});