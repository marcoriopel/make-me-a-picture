import { UsersModel } from '@app/models/users.model';
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
import { UserService } from '../user.service';

@injectable()
export class SocketConnectionService {
    private socketIdLinks: Map<string, any> = new Map<string, any>();
    private externalWindowSocketIds: string[] = [];

    constructor(
        @inject(TYPES.SocketService) private socketService: SocketService,
        @inject(TYPES.TokenService) private tokenService: TokenService,
        @inject(TYPES.AuthService) private authService: AuthService,
        @inject(TYPES.UserService) private userService: UserService,
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

            socket.on('openExternalChat', (data: any) => {
                if(data.isExternalWindow){
                    this.externalWindowSocketIds.push(socket.id);
                }
                this.socketIdLinks.set(data.linkedSocketId, socket);
                this.socketService.getSocket().to(data.linkedSocketId).emit('openExternalChatCallback', { "externalWindowSocketid": socket.id });
            });

            socket.on('closeExternalChat', (data: any) => {
                let externalSocket = this.socketIdLinks.get(data.mainWindowId);
                this.socketIdLinks.delete(data.mainWindowId);
                if(externalSocket) this.socketIdLinks.delete(externalSocket.id);
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
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                try {
                    this.lobbyManagerService.removePlayerFromLobby(user, request.lobbyId)
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
            });

            socket.on('leaveGame', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                this.leaveRoom(socket, request.gameId);
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                try {
                    this.gameManagerService.disconnectGame(request.gameId, user.username);
                } catch (err) {
                    this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
                }
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

            socket.on('drawingSuggestions', (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                try {
                    this.gameManagerService.requestSuggestions(user.username, request.gameId)
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

            socket.on('joinChatRoom', async (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                try {
                    const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                    socket.join(request.chatId);
                    await this.userService.addUserToChat(user.username, request.chatId)
                    await this.chatManagerService.addUserToChat(user.username, request.chatId)
                    this.socketService.getSocket().to(socket.id).emit('joinChatRoomCallback');
                    if(this.socketIdLinks.has(socket.id)){
                        let linkedSocket = this.socketIdLinks.get(socket.id);
                        linkedSocket.join(request.chatId);
                        this.socketService.getSocket().to(linkedSocket.id).emit('refreshChatRequest', {chatId: request.chatId});
                    }
                }
                catch (e) {
                    console.error(e);
                }
            });

            socket.on('leaveChatRoom', async (request: any) => {
                if (!(request instanceof Object)) {
                    request = JSON.parse(request)
                }
                try {
                    const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                    socket.leave(request.chatId);
                    await this.userService.removeUserFromChat(user.username, request.chatId)
                    await this.chatManagerService.removeUserFromChat(user.username, request.chatId)
                    this.socketService.getSocket().to(socket.id).emit('leaveChatRoomCallback');
                    if(this.socketIdLinks.has(socket.id)){
                        let linkedSocket = this.socketIdLinks.get(socket.id);
                        linkedSocket.leave(request.chatId);
                        this.socketService.getSocket().to(linkedSocket.id).emit('refreshChatRequest', {chatId: "General"});
                    }
                }
                catch (e) {
                    console.error(e);
                }
            });

            socket.on('disconnect', () => {
                try {
                    if(!this.externalWindowSocketIds.includes(socket.id)){
                        const user: any = this.tokenService.getTokenInfo(socket.handshake.query.authorization);
                        this.authService.addUserToLogCollection(user.username, false);
                        console.log('disconnection of ' + user.username);
                        const lobbyId = this.lobbyManagerService.isUserInLobby(user.username);
                        if (lobbyId) {
                            this.lobbyManagerService.removePlayerFromLobby(user, lobbyId)
                        }
                        const gameId = this.gameManagerService.isUserInGame(user.username);
                        if (gameId) {
                            this.gameManagerService.disconnectGame(gameId, user.username);
                        }
                    }
                    else{
                        for( let i = 0; i < this.externalWindowSocketIds.length; i++){ 
                            if ( this.externalWindowSocketIds[i] === socket.id) { 
                                this.externalWindowSocketIds.splice(i, 1); 
                            }
                        }
                    }
                }
                catch (e) {
                    console.error(e)
                }

            });
        });
    }

    leaveRoom(socket: socketio.Socket, roomId: string) {
        try {
            var s = socket.rooms[roomId]
            console.log(s);
            socket.leave(roomId);
            var s = socket.rooms[roomId]
            console.log(s);
        } catch (err) {
            this.socketService.getSocket().to(socket.id).emit('error', { "error": err.message });
        }
    }
}
