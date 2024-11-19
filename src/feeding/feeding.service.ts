import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FeedingService {
    private mealConfig: any;
    private configFilePath = path.join(__dirname, 'data', 'meal-config.json');
    private espIp: string | null = null; // Variável para armazenar o IP

    // Método para definir o IP
    setEspIp(ip: string): void {
      this.espIp = ip;
    }
  
    // Método para obter o IP armazenado
    getEspIp(): string | null {
      return this.espIp;
    }

    constructor() {
        this.loadMealConfig();

        // Recarrega as configurações sempre que o arquivo for alterado
        fs.watchFile(this.configFilePath, (curr, prev) => {
            console.log('Configuração de alimentação alterada. Recarregando...');
            this.loadMealConfig(); // Recarrega as configurações
        });

        // Chama a verificação de horários a cada 5 segundos (5000ms)
        setInterval(() => this.checkMealTimeAndFeed(), 5000);
    }

    // Método para salvar a configuração de alimentação
    async saveMealConfig(config: any): Promise<any> {
        const dirPath = path.join(__dirname, 'data'); // Diretório onde o arquivo será salvo
        const filePath = path.join(dirPath, 'meal-config.json');

        // Verifique se o diretório existe, e crie-o caso contrário
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true }); // Cria o diretório de forma recursiva
        }

        return new Promise((resolve, reject) => {
            console.log('Salvando configurações em:', filePath);

            fs.writeFile(filePath, JSON.stringify(config, null, 2), (err) => {
                if (err) {
                    console.error('Erro ao salvar configurações:', err);
                    reject({ message: 'Erro ao salvar configurações.' });
                } else {
                    console.log('Configurações salvas com sucesso!');
                    resolve({ message: 'Configurações salvas com sucesso!' });
                }
            });
        });
    }

    // Método para simular a alimentação do pet
    async feed(): Promise<any> {
        const ipArduino = '192.168.0.91:80';  // Definindo o IP manualmente
        
        // Verifica se o IP do Arduino foi configurado
        if (!ipArduino) {
            throw new Error('IP do Arduino não encontrado. Certifique-se de que o IP foi definido corretamente.');
        }
    
        try {
            // Construindo a URL para enviar o comando ao Arduino
            const url = `http://${ipArduino}/comando`;  // Ajuste conforme a rota do Arduino
            
            // Enviando uma requisição GET para o Arduino
            const response = await axios.get(url, { timeout: 100000 });
    
            // Verifica se a resposta do servidor é bem-sucedida
            if (response.status === 200) {
                console.log('Resposta do Arduino:', response.data);  // Exibe a resposta do Arduino (opcional)
                return { message: 'Comando enviado ao Arduino com sucesso!' };
            } else {
                throw new Error(`Erro ao comunicar com o Arduino. Status: ${response.status}`);
            }
        } catch (error) {
            // Tratamento de erro melhorado
            console.error('Erro ao enviar comando para o Arduino:', error);
            
            // Verificando se o erro veio do Axios ou é um erro genérico
            if (error.response) {
                // Se o erro é específico da resposta do servidor (erro HTTP)
                return { message: `Erro do servidor Arduino: ${error.response.data || error.message}` };
            } else if (error.request) {
                // Se não recebeu resposta do servidor
                return { message: 'Erro de conexão com o Arduino. Verifique o status da rede ou IP do dispositivo.' };
            } else {
                // Erro genérico
                return { message: 'Erro desconhecido ao enviar comando ao Arduino.' };
            }
        }
    }
    

    // Carrega a configuração de alimentação do arquivo
    private loadMealConfig() {
        if (fs.existsSync(this.configFilePath)) {
            try {
                this.mealConfig = JSON.parse(fs.readFileSync(this.configFilePath, 'utf-8'));
                console.log('Configuração de alimentação carregada:', this.mealConfig);
            } catch (error) {
                console.error('Erro ao carregar o arquivo de configuração:', error);
            }
        } else {
            console.error('Arquivo de configuração não encontrado.');
        }
    }

    // Verifica os horários de alimentação e realiza a alimentação
    public checkMealTimeAndFeed() {
        if (!this.mealConfig || !this.mealConfig.mealTimes) {
            console.log('Nenhuma configuração de alimentação encontrada.');
            return;
        }

        const now = new Date();

        let fedOnce = false; // Flag para controlar a alimentação

        this.mealConfig.mealTimes.forEach((meal: { time: string; fed: boolean; lastFedDate: string }, index: number) => {
            // Verifica se o horário da refeição está definido e é uma string válida
            if (!meal.time) {
                console.log('Horário da refeição não definido, pulando...');
                return; // Pula a refeição se o horário não estiver definido
            }

            const [hour, minute] = meal.time.split(':').map(Number);

            if (isNaN(hour) || isNaN(minute)) {
                console.log('Horário inválido, pulando...');
                return; // Pula a refeição se o horário for inválido
            }

            const mealDate = new Date(now);
            mealDate.setHours(hour, minute, 0, 0);

            // Verifica se o horário de alimentação é o mesmo do horário atual
            if (now.getHours() === mealDate.getHours() && now.getMinutes() === mealDate.getMinutes() && !meal.fed && !fedOnce) {
                // Adiciona uma condição para garantir que a alimentação não ocorra novamente
                console.log(`Hora de alimentar o pet! Hora configurada: ${meal.time}`);
                this.feed(); // Alimenta o pet

                // Marca a refeição como alimentada
                this.mealConfig.mealTimes[index].fed = true;
                fedOnce = true; // Impede múltiplas alimentações no mesmo ciclo

                // Atualiza a configuração de refeições, caso queira salvar novamente
                this.saveMealConfig(this.mealConfig);
            }
        });
    }
}
