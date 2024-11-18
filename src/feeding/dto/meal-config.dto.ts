import { ApiProperty } from '@nestjs/swagger';

export class MealDto {
  @ApiProperty({
    description: 'Horário da refeição no formato HH:MM',
    example: '08:00',
  })
  time: string;

  @ApiProperty({
    description: 'Indica se a refeição foi dada',
    example: false,
  })
  fed: boolean;

  @ApiProperty({
    description: 'Data e hora da última alimentação no formato ISO 8601',
    example: '2024-11-17T08:00:00.000Z',
  })
  lastFedDate: string | null;
}

export class MealConfigDto {
  @ApiProperty({
    description: 'Número de refeições por dia',
    example: 2,
  })
  mealCount: number;

  @ApiProperty({
    description: 'Horários das refeições e informações associadas',
    type: [MealDto],
    example: [
      { time: '08:00', fed: false, lastFedDate: null },
      { time: '19:30', fed: false, lastFedDate: null },
    ],
  })
  mealTimes: MealDto[];

  @ApiProperty({
    description: 'Indica se a alimentação é diária',
    example: true,
  })
  isEveryday: boolean;

  @ApiProperty({
    description: 'Dias da semana selecionados para alimentação',
    example: ['Monday', 'Wednesday', 'Friday'],
  })
  selectedDays: string[];
}
