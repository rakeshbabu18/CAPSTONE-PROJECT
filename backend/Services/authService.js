import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import {UserTypeModel} from '../Models/UserModel.js'

// register function
export const register = async (userObj) => {
    const userDoc = new UserTypeModel(userObj)

    await userDoc.validate()

    userDoc.password = await bcrypt.hash(userDoc.password, 10)

    const created = await userDoc.save()

    const newUserObj = created.toObject()
    delete newUserObj.password

    return newUserObj
}

// authenticate function
export const authenticate = async ({ email, password }) => {

    const user = await UserTypeModel.findOne( {email });//finding the user by user email

    if (!user) {
        const err = new Error("Invalid email")
        err.status = 404 
        throw err
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        const err = new Error("Invalid password")
         err.status = 404 
         throw err
    }

    if (!user.isActive) {
    const err = new Error("Your account is blocked by admin");
    err.status = 403;
    throw err;
}


    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, profileImageUrl: user.profileImageUrl},
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const newUserObj = user.toObject();
    delete newUserObj.password;

 
    return { user: newUserObj, token };
};

