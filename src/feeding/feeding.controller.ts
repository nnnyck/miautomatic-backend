import { Controller, Post, Body, HttpException, HttpStatus, Get, Headers } from '@nestjs/common';
import { FeedingService } from './feeding.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MealConfigDto } from './dto/meal-config.dto';

@Controller()
export class FeedingController {

  private espIp: string | null = null; // Variável para armazenar o IP
   // Método para definir o IP
   setEspIp(ip: string): void {
    this.espIp = ip;
  }

  // Método para obter o IP armazenado
  getEspIp(): string | null {
    return this.espIp;
  }

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
    try {
      // Envia o sinal para o Arduino para alimentar o pet
      const result = await this.feedingService.feed();

      // Se o comando foi enviado com sucesso
      return {
        statusCode: HttpStatus.CREATED,
        message: result.message || 'Pet alimentado com sucesso!',
      };
    } catch (error) {
      console.error('Erro ao alimentar o pet:', error);

      // Caso haja algum erro ao enviar o comando para o Arduino
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao alimentar o pet, tente novamente.',
      };
    }
  }

  @Get('register_ip')
  @ApiOperation({ summary: 'recebe o ip do esp01' })
  async registerIp(@Headers('x-esp-ip') espIp: string) {
    if (!espIp) {
      throw new HttpException('Erro: Cabeçalho X-ESP-IP não fornecido', HttpStatus.BAD_REQUEST);
    }

    this.feedingService.setEspIp(espIp);
    this.espIp = espIp; // Armazena o IP recebido
    console.log(`IP recebido e armazenado: ${espIp}`);
    return { message: `IP ${espIp} registrado com sucesso!` };
  }

  // Endpoint para verificar o IP armazenado
  @Get('get_stored_ip')
  @ApiOperation({ summary: 'consulta o ip armazenado'})
  getStoredIp() {
    return this.espIp
      ? { message: `IP registrado: ${this.espIp}` }
      : { message: 'Nenhum IP registrado' };
  }
}
