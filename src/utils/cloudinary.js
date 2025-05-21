import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File has been uploaded", uploadResult.url);
        await fs.unlinkSync(localFilePath);
        return uploadResult;
    } catch (error) {
        await fs.unlinkSync(localFilePath);
        console.log(error);
        return null;
    }
};

const deleteFromCloudinary = async (publicId, resource_type = "image") => {
    try {
        const isDeleteSucessFull = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource_type,
        });
        return isDeleteSucessFull;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
