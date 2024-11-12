import amqp from "amqplib";
import { rabbitMQ } from "./config.js";

class Producer {
  channel;

  async createChannel() {
    const connection = await amqp.connect(rabbitMQ.url);
    this.channel = await connection.createChannel();
  }

  async publishMessage(messageContent) {
    if (!this.channel) {
      await this.createChannel();
    }
  
    const exchangeName = rabbitMQ.exchangeName;
    await this.channel.assertExchange(exchangeName, "fanout");  // Cambia a fanout
  
    const logDetails = {
      ...messageContent,  // Contenido del mensaje
      exchangeName,
      dateTime: new Date(),
    };
  
    // Al usar un "fanout" exchange, el routingKey se deja vacío ("")
    await this.channel.publish(
      exchangeName,
      "",
      Buffer.from(JSON.stringify(logDetails))
    );
  
    console.log(
      `Mensaje enviado al exchange ${exchangeName} para todos los microservicios conectados.`
    );
  }
}

export default Producer;