import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FeedingService {
    private mealConfig: any;
    private configFilePath = path.join(__dirname, 'data', 'meal-config.json');

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
        console.log('Pet alimentado com sucesso!');
        return { message: 'Pet alimentado com sucesso!' };
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
        console.log(now);
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
