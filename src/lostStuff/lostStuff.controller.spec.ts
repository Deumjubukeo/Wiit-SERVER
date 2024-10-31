import { Test, TestingModule } from '@nestjs/testing';
import { LostStuffController } from './lostStuff.controller';
import { LostStuffService } from './lostStuff.service';

describe('LostStuffController', () => {
  let controller: LostStuffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LostStuffController],
      providers: [LostStuffService],
    }).compile();

    controller = module.get<LostStuffController>(LostStuffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
