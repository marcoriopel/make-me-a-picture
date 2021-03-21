import { UserCredentialsModel } from '@app/models/user-credentials.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import * as socketio from "socket.io";
import * as jwt from 'jsonwebtoken';
import * as http from 'http';
import { ChatManagerService } from '../managers/chat-manager.service';
import { IncomingMessage } from '@app/ressources/interfaces/incoming-message.interface';
import { LobbyManagerService } from '../managers/lobby-manager.service';
import { TokenService } from '../token.service';
import { SocketService } from './socket.service';
import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { GameManagerService } from '../managers/game-manager.service';
import { AuthService } from '../auth.service';

@injectable()
export class SocketConnectionService {


    constructor(
        @inject(TYPES.SocketService) private socketService: SocketService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.AuthService) private authService: AuthService,
        @inject(TYPES.GameManagerService) private gameManagerService: GameManagerService,
        @inject(TYPES.ChatManagerService) private chatManagerService: ChatManagerService,
        @inject(TYPES.LobbyManagerService) private lobbyManagerService: LobbyManagerService,
    ) {
        this.socketService = SocketService.getInstance();
        this.tokenService = TokenService.getInstance();
    }

    start(): void {
        this.socketService.getSocket().on("connection", (socket: socketio.Socket) => {
            socket.on('message', (message: IncomingMessage) => {
                if (!(message instanceof Object)) {
                    message = JSON.parse(message)
                }
                try {
                    let date: Date = new Date();
                    const user: any = this.tokenService.getTokenInfo(message.token);
                    this.chatManagerService.addMessageToDB(user, message, date);
                    this.chatManagerService.dispatchMessage(user, message, date);
                } catch (err) {
                    console.log(err);
                }
            });

            socket.on('drawingEvent', (drawingEvent: DrawingEvent) => {
                if (!(drawingEvent instanceof Object)) {
                    drawingEvent = JSON.parse(drawingEvent)
                }
                try {
                    const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                    this.gameManagerService.dispatchDrawingEvent(user, drawingEvent);
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('listenLobby', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                try {
                    socket.leave("tmp" + request.oldLobbyId);
                    if (this.lobbyManagerService.lobbyExist(request.lobbyId)) {
                        socket.join('tmp' + request.lobbyId);
                        this.lobbyManagerService.dispatchTeams(request.lobbyId)
                    }
                    else
                        throw new Error("This lobby does not exist")
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('joinLobby', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                try {
                    if (this.lobbyManagerService.lobbyExist(request.lobbyId)) {
                        socket.leave("tmp" + request.lobbyId);
                        socket.join(request.lobbyId);
                        this.lobbyManagerService.dispatchTeams(request.lobbyId)
                    }
                    else
                        throw new Error("This lobby does not exist")
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('leaveLobby', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                this.leaveRoom(socket, request.lobbyId);
                this.lobbyManagerService.dispatchTeams(request.lobbyId)
            });

            socket.on('leaveGame', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                this.leaveRoom(socket, request.gameId);
            });

            socket.on('guessDrawing', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                try {
                    this.gameManagerService.guessDrawing(request.gameId, user.username, request.guess)
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('hintRequest', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                try {
                    this.gameManagerService.requestHint(request.gameId, user);
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('joinChatRoom', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                socket.join(request.chatId);
                this.authService.addUserToChat(user.username, request.chatId)
                this.chatManagerService.addUserToChat(user.username, request.chatId)
                // console.log(this.socketService.getSocket().sockets.adapter.rooms.get(request.chatId));
            });

            socket.on('leaveChatRoom', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                socket.leave(request.chatId);
                this.authService.removeUserFromChat(user.username, request.chatId)
                this.chatManagerService.removeUserFromChat(user.username, request.chatId)
                // console.log(this.socketService.getSocket().sockets.adapter.rooms.get(request.chatId));
            });

            socket.on('disconnect', () => {
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                this.authService.addUserToLogCollection(user.username, false);
                console.log('disconnection of ' + user.username);
              });
        });
    }

    leaveRoom(socket: socketio.Socket, roomId: string) {
        try {
            socket.leave(roomId);
        } catch (err) {
            this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
        }
    }
}