import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('LanguagesController', () => {
  let controller: LanguagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        { provide: LanguagesService, useValue: {} },
        { provide: JwtAuthGuard, useValue: { canActivate: () => true } },
        { provide: RolesGuard, useValue: { canActivate: () => true } },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
