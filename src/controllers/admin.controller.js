import { asyncHandler } from "../utils/asyncHandler.js";

const isAdmin = asyncHandler(async (req, res, next) => {
    return res.status(201).json({
        response: new ApiResponse(200, isNewUserCreated, "User Created", 200),
    });
});

export { isAdmin };
