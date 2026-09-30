import jwt from "jsonwebtoken";

export const authenticate = async (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken || !authToken.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authorization required." });
    }

    try {
        const token = authToken.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id;
        req.email = decoded.email;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token is expired.",
            });
        }
        return res.status(401).json({ success: false, message: "Invalid Token" });
    }
};

/** Ensures the authenticated user matches the `:id` route param (user id). */
export const authorizeSelf = (req, res, next) => {
    if (String(req.userId) !== String(req.params.id)) {
        return res.status(403).json({ success: false, message: "Forbidden." });
    }
    next();
};
