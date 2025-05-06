import { asyncHandler } from '../../utils/asyncHandler.js';
import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { ApiResponse } from "../../utils/apiResponse.js";

const getAllUSers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password -refreshToken');

    if (!users || users.length === 0) {
        throw new ApiError(404, "No users found", [], "Not Found");
    }

    return res.status(200).json({
        response: new ApiResponse(200, users, "Users fetched successfully", 200)
    });
});

export {getAllUSers}