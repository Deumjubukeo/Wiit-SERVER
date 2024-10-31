import { Test, TestingModule } from '@nestjs/testing';
import { LostStuffService } from './lostStuff.service';

describe('LostStuffService', () => {
  let service: LostStuffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LostStuffService],
    }).compile();

    service = module.get<LostStuffService>(LostStuffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
