import { StudentWaitingList } from "../models/StudentWaitingList";
import { User } from "../models/User";
import {
  ACCEPTANCE_STATUS,
  DAYS,
  ERRORCODE,
  ROLE,
  createErrorObject,
} from "../utils";
import {
  IPostUserPayload,
  IPutClassUser,
  IPutUserMasterData,
  IPutUserProfile,
} from "../utils/interfaces/User";
import { v4 as uuidv4 } from "uuid";

export class UserService {
  private userModel: User;
  private studentWaitingListModel: StudentWaitingList;

  constructor() {
    this.userModel = new User();
    this.studentWaitingListModel = new StudentWaitingList();
  }

  async getSchedulesByDay(userId: string, date: Date) {
    return this.userModel.getClassSchedulesByDay(
      userId,
      DAYS[date.getDay() - 1]
    );
  }

  async getUserClasses(userId: string, page: number = 1) {
    return this.userModel.getUserClassesByUserId(userId, page);
  }

  async addStudentClassWaitingList(userId: string, payload: IPutClassUser) {
    const user = await this.userModel.getUserById(userId);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    if (user.role !== ROLE.STUDENT) {
      return createErrorObject(
        400,
        "user's not student",
        ERRORCODE.BAD_REQUEST_ERROR
      );
    }

    if (payload.isCancelled) {
      const studentWaitingList =
        await this.studentWaitingListModel.getStudentWaitingListByUserIdAndClassId(
          userId,
          payload.classId
        );

      if (!studentWaitingList) {
        return createErrorObject(
          404,
          "you don't request to this class",
          ERRORCODE.COMMON_NOT_FOUND
        );
      }

      if (studentWaitingList.status !== ACCEPTANCE_STATUS.PENDING) {
        return createErrorObject(
          400,
          "request has been accepted cannot cancel",
          ERRORCODE.BAD_REQUEST_ERROR
        );
      }

      return this.studentWaitingListModel.deleteStudentWaitingListByUserIdAndClassId(
        userId,
        payload.classId
      );
    }

    return this.studentWaitingListModel.insertStudentWaitingList(
      uuidv4(),
      userId,
      payload
    );
  }

  async getUserById(id: string) {
    const user = await this.userModel.getUserById(id);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    return user;
  }

  async updateUserProfileMaster(id: string, payload: IPutUserMasterData) {
    const user = await this.userModel.getUserById(id);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    return this.userModel.updateUserByUserId(id, payload);
  }

  async deleteUserById(id: string) {
    const user = await this.userModel.getUserById(id);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    return this.userModel.deleteUserById(id);
  }

  async getAllUsers(
    page: number = 1,
    search?: string | undefined,
    role?: ROLE | string | undefined
  ) {
    return this.userModel.getAllUsers(page, search, role);
  }

  async getUserProfilePicture(username: string) {
    const user = await this.userModel.getUserByUsername(username);

    if (!user?.profilePic) {
      return createErrorObject(
        404,
        "no profile picture's uploaded",
        ERRORCODE.PROFILE_PICTURE_NOT_FOUND_ERROR
      );
    }

    return user?.profilePic;
  }

  async deleteUserByUsername(username: string) {
    const user = await this.userModel.getUserByUsername(username);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    return this.userModel.deleteUserByUsername(username);
  }

  async addNewUser(payload: IPostUserPayload) {
    return this.userModel.inserNewUser(uuidv4(), payload);
  }

  async updateUserProfile(username: string, payload: IPutUserProfile) {
    return this.userModel.updateUserProfileByUsername(username, payload);
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.getUserByUsername(username);

    if (!user) {
      return createErrorObject(
        404,
        "user's not found",
        ERRORCODE.USER_NOT_FOUND_ERROR
      );
    }

    return user;
  }
}
