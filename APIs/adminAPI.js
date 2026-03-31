import exp from 'express'
import { UserTypeModel } from '../Models/UserModel.js'
import { verifyToken } from '../Middlewares/verifyToken.js'
import { ArticleModel } from '../Models/ArticleModel.js'

const adminRoute = exp.Router()

const setAllowedRoles = (roles) => (req, res, next) => {
    req.allowedRoles = roles;
    next();
};

adminRoute.use(setAllowedRoles(["ADMIN"]));

// read users for admin dashboard
adminRoute.get('/users', verifyToken, async (req, res, next) => {
    try {
        const users = await UserTypeModel.find().select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            message: 'All users fetched',
            payload: users
        });
    } catch (err) {
        next(err);
    }
});

// reading articles by admin
adminRoute.get('/articles', verifyToken, async (req, res, next) => {
    try {
        const articles = await ArticleModel
            .find()
            .populate('author', 'firstName lastName email role')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'All articles fetched',
            payload: articles
        });
    } catch (err) {
        next(err);
    }
});


// block users
adminRoute.put('/block-user/:id', verifyToken, async (req, res, next) => {
    try {
        const user = await UserTypeModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Admin user cannot be blocked' });
        }

        user.isActive = false;
        await user.save();

        res.status(200).json({ message: 'User blocked successfully' });
    } catch (err) {
        next(err);
    }
});



// unblock users
adminRoute.put('/unblock-user/:id', verifyToken, async (req, res, next) => {
    try {
        const user = await UserTypeModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = true;
        await user.save();

        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (err) {
        next(err);
    }
});



export default adminRoute
