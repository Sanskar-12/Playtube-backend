import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Db connected at host: ${connection.host}`);
  } catch (error) {
    console.log(error);
  }
};

export default connectToDB;
