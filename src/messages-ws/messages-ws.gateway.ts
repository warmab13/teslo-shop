import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,

    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify( token );
      await this.messagesWsService.registerClient( client, payload.id );
    } catch (error) {
      client.disconnect();
      return;
    }

    console.log({ payload })
    //console.log("Cliente online", client.id)

    //console.log({ online: this.messagesWsService.getConnectedClients() })

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    
  }
  handleDisconnect(client: Socket) {
    //console.log("Client disconnected", client.id)
    this.messagesWsService.removeClient( client.id );

    //console.log({ online: this.messagesWsService.getConnectedClients() })

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  //message-from-client
  @SubscribeMessage('messages-from-client')
  handleMessageFromClient( client: Socket, payload: NewMessageDto ){
    //messages-from-server

    //Emite only to client
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo',
    //   message: payload.message || 'no-message'
    // })

    //Emitir a todos menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message!!!',
    // });

    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no-message'
    })
  }



}
