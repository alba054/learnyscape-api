import { IPostSubject, IPutSubject } from "../utils/interfaces/Subject";
import { catchPrismaError, constants, createErrorObject } from "../utils";
import db from "../database";

export class Subject {
  async getAllSubjects(page: number = 1, search: string | undefined) {
    return db.subject.findMany({
      skip: (page - 1) * constants.PAGINATION_OFFSET,
      take: constants.PAGINATION_OFFSET,
      where: {
        AND: [
          {
            OR: [
              { name: search === "" ? undefined : { contains: search } },
              { code: search === "" ? undefined : { startsWith: search } },
            ],
          },
        ],
      },
    });
  }

  async deleteSubjectById(id: string) {
    try {
      return await db.subject.delete({
        where: { id },
      });
    } catch (error) {
      return catchPrismaError(error);
    }
  }

  async updateSubjectById(id: string, payload: IPutSubject) {
    try {
      return await db.subject.update({
        where: {
          id,
        },
        data: {
          code: payload.code,
          name: payload.name,
        },
      });
    } catch (error) {
      return catchPrismaError(error);
    }
  }

  async getSubjectById(id: string) {
    return db.subject.findUnique({
      where: {
        id,
      },
    });
  }

  async inserNewSubject(id: string, payload: IPostSubject) {
    try {
      return await db.subject.create({
        data: {
          id,
          name: payload.name,
          code: payload.code,
        },
      });
    } catch (error) {
      return catchPrismaError(error);
    }
  }
}
