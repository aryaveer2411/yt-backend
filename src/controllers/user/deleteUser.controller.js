import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { ApiResponse } from "../../utils/apiResponse.js";

const deleteUser = asyncHandler(async (req, res) => {
    const { userID } = req.query;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(400, "user doesnt exist");
    }
    const userDeleted = await User.findByIdAndDelete(userID).lean();
    if (!userDeleted) {
        throw new ApiError(400, "Cant fullfill opertaion");
    }
    // Convert the deleted user to a plain object to avoid circular references
    // const userDeletedPlain = userDeleted.toObject();
    return res.status(201).json({
        response: new ApiResponse(200, userDeleted, "User Deleted", 200)
    })
});

export { deleteUser };