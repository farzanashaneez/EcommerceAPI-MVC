import { Request } from "express";
import { IUser } from "../models/User"; // adjust the path to your IUser definition

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}
