import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { LevelsService } from "./levels.service";

describe("LevelsService", () => {
  let service: LevelsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    level: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<LevelsService>(LevelsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new level", async () => {
      const dto = { name: "Beginner", code: "A1" };
      const expected = { id: "1", ...dto };
      mockPrismaService.level.create.mockResolvedValue(expected);

      const result = await service.create(dto);
      expect(result).toEqual(expected);
    });

    it("should throw ConflictException on duplicate code/name", async () => {
      mockPrismaService.level.create.mockRejectedValue({ code: "P2002" });
      await expect(service.create({ name: "Beginner", code: "A1" })).rejects.toThrow(ConflictException);
    });
  });

  describe("findOne", () => {
    it("should return level if found", async () => {
      const expected = { id: "1", name: "Beginner", code: "A1" };
      mockPrismaService.level.findUnique.mockResolvedValue(expected);

      const result = await service.findOne("1");
      expect(result).toEqual(expected);
    });

    it("should throw NotFoundException if not found", async () => {
      mockPrismaService.level.findUnique.mockResolvedValue(null);
      await expect(service.findOne("999")).rejects.toThrow(NotFoundException);
    });
  });
});
