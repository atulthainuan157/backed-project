import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


// generate access token and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = User.generateAccessToken();
        const refreshToken = User.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}


// Register user
const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation
    // check if user already exist : username, email
    // check for images, check for avatar
    // upload them to cludinary
    // create user object - create entry  in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { fullname, email, username, password } = req.body
    // console.log("email: ", email);
    if (!username || !email || !fullname || !password) {
        throw new ApiError(400, "All fields are required...");
    }

    if (fullname.trim() === "" || email.trim() === "" || username.trim() === "" || password.trim() === "") {
        throw new ApiError(400, "All fields are required...");
    }


    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with either same username or email exists");
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar image is required");
    }


    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered succesfully")
    );

});


// Login user
const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend, req->body
    // validation
    // check if user exists: username, email
    // check for password is correct 
    // generate access token and refresh token
    // save refresh token to database 
    // send cookie with refresh token
    // return response

    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await User.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        // to make the cookies modified only by server
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in succesfully"
        )
    );

});


// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    // get refresh token from cookies
    // validation
    // check if user exists with the refresh token
    // remove refresh token from database
    // clear cookies
    // return response

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined,
            }
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200).cleaCookie("accessToken", options).cleaCookie("refreshToken", options).json(
        new ApiResponse(
            200,
            {},
            "User logged out succesfully"
        )
    );
});


export { registerUser, loginUser, logoutUser };