import { Controller, Post, Body } from '@nestjs/common';
import { FeedingService } from './feeding.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MealConfigDto } from './dto/meal-config.dto';

@Controller()
export class FeedingController {
  constructor(private readonly feedingService: FeedingService) {}

  @Post('save-meal-config')
  @ApiOperation({ summary: 'Salva uma nova rotina de alimentação de pet' })
  @ApiResponse({
    status: 201,
    description: 'Configuração da rotina salva com sucesso!',
    type: MealConfigDto,
  })
  @ApiResponse({ status: 400, description: 'Erro ao salvar a configuração.' })
  async saveMealConfig(@Body() config: MealConfigDto) {
    return this.feedingService.saveMealConfig(config);
  }

  @Post('feed')
  @ApiOperation({ summary: 'Alimenta o pet imediatamente' })
  @ApiResponse({ status: 201, description: 'Pet alimentado com sucesso!' })
  async feedPet() {
    return this.feedingService.feed();
  }
}
