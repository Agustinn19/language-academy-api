import { Test, TestingModule } from "@nestjs/testing";
import { LevelsController } from "./levels.controller";
import { LevelsService } from "./levels.service";

describe("LevelsController", () => {
  let controller: LevelsController;
  let service: LevelsService;

  const mockLevelsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LevelsController],
      providers: [{ provide: LevelsService, useValue: mockLevelsService }],
    }).compile();

    controller = module.get<LevelsController>(LevelsController);
    service = module.get<LevelsService>(LevelsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call create", async () => {
    const dto = { name: "Beginner", code: "A1" };
    mockLevelsService.create.mockResolvedValue({ id: "1", ...dto });
    expect(await controller.create(dto)).toEqual({ id: "1", ...dto });
  });

  it("should call findAll", async () => {
    mockLevelsService.findAll.mockResolvedValue([]);
    expect(await controller.findAll()).toEqual([]);
  });
});
