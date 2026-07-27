import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";



export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log("Access Token:", accessToken);
        console.log("Cookies:", req.cookies);
        console.log("Authorization:", req.headers.authorization);

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized access to this account");
        }


        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken ");

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