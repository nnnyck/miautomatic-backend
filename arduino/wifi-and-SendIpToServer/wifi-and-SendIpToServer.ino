#include "WiFiEspAT.h"

// Emulate Serial1 on pins 7/6 if not present
#ifndef HAVE_HWSERIAL1
#include "SoftwareSerial.h"
SoftwareSerial Serial1(6, 7);  // RX, TX
#endif

// Informações do Wi-Fi
char ssid[] = "Seixas";      // seu SSID de rede
char pwd[] = "@ianaseixas";  // sua senha de rede

// Cria o servidor na porta 80
WiFiServer serverHTTP(80); 

int motorPin = 3;

void setup() {
  Serial.begin(115200);   // Comunicação com o Serial Monitor
  Serial1.begin(115200);  // Comunicação com o ESP-01 (ajustado para 115200)

   pinMode(motorPin, OUTPUT);

  // Aguarda alguns segundos para estabilizar a comunicação com o ESP
  delay(2000);
  Serial.println("Iniciando comunicação com ESP-01");

  // Inicializa o ESP-01 com WiFiEspAT
  WiFi.init(&Serial1);

  // Verifica se o módulo ESP-01 foi detectado
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("ESP-01 não foi detectado. Verifique as conexões e o baud rate.");
    while (true);  // Pausa infinita para diagnóstico
  }

  // Conectando ao Wi-Fi uma vez
  Serial.println("Tentando conectar ao Wi-Fi...");
  if (WiFi.begin(ssid, pwd) == WL_CONNECTED) {
    Serial.println("Conectado com sucesso ao Wi-Fi!");

    IPAddress ip = WiFi.localIP();

    // Tenta obter o IP até que seja válido
    int attempt = 0;
    while (ip[0] == 0 && attempt < 10) {  // Tenta até 10 vezes
      Serial.println("Falha ao obter IP. Tentando novamente...");
      delay(1000);  // Aguarda 1 segundo antes de tentar novamente
      ip = WiFi.localIP();
      attempt++;
    }

    if (ip[0] != 0) {
      Serial.print("Endereço IP: ");
      Serial.println(ip);
    } else {
      Serial.println("Falha ao obter IP após várias tentativas.");
    }
  } else {
    Serial.println("Falha ao conectar. Verifique SSID e senha.");
  }

  // Inicia o servidor HTTP
  serverHTTP.begin();
  Serial.println("Servidor HTTP iniciado e aguardando requisições...");
}

void loop() {
  WiFiClient clientHTTP = serverHTTP.available(); 
  if (clientHTTP) {  
    Serial.println("Cliente conectado.");

    String request = "";
    while (clientHTTP.available()) {
      char c = clientHTTP.read();
      request += c;
    }

    Serial.println("Requisição recebida:");
    Serial.println(request);

    if (request.indexOf("/comando") != -1) {
      Serial.println("Motor ativado.");
      digitalWrite(motorPin, HIGH);  // Liga o motor
      delay(2000);                   // Motor fica ligado por 2 segundos
      digitalWrite(motorPin, LOW);   // Desliga o motor
      Serial.println("Motor desativado.");
    }

    clientHTTP.println("HTTP/1.1 200 OK");
    clientHTTP.println("Content-Type: text/html");
    clientHTTP.println("Connection: close");
    clientHTTP.println();
    clientHTTP.println("<html><body><h1>Comando recebido!</h1></body></html>");
    delay(1);
    clientHTTP.stop();
    Serial.println("Cliente desconectado.");
  }
}
