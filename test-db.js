import 'dotenv/config.js';
import { connect, disconnect } from 'mongoose';
import { UserTypeModel } from './Models/UserModel.js';

async function test() {
  try {
    await connect(process.env.DB_URL);
    const user = await UserTypeModel.findById('69ae8b1435d1aa693da5eded');
    
    const allUsers = await UserTypeModel.find();
    
    await disconnect();
  } catch (err) {
    console.error(err);
  }
}
test();
