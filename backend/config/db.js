import mongoose from "mongoose";

export default async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("mongoDb has connected successfully");
  } catch (error) {
    console.log("mongoDb has run into some issues", error);
  }
}
