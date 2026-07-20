import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file as been upload succesfully
        // console.log("File is succesfully upload in cloudinary ", response.url);
        fs.unlinkSync(localFilePath);   // remove the locally saved temporary file after the file has been uploaded successfully
        // console.log(response);
        return response;
    }
    catch (error) {
        fs.unlinkSync(localFilePath);   // remove the locally saved temporary file if the file upload failed
        console.error("Error uploading file to Cloudinary:", error);
        return null;
    }
}


export { uploadOnCloudinary };