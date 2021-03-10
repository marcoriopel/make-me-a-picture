import { Drawing } from '@app/ressources/interfaces/drawings.interface';
import { DrawingEvent } from '@app/ressources/interfaces/game-events';
import { BasicUser, Player } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { SocketService } from '@app/services/sockets/socket.service';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { ClassicLobby } from '../lobby/classic-lobby';
import { Lobby } from '../lobby/lobby';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Game } from './game';

@injectable()
export class ClassicGame extends Game {
    private teams: Map<string, Player>[] = [new Map<string, Player>(), new Map<string, Player>()];
    private drawingTeam: number;
    private drawingPlayer: Player[] = new Array(2);

    private score: number[] = [0,0];
    private isGuessingOk: boolean[] = [false, false];
    private round: number = 0;
    private currentDrawingName: string;
    
    constructor(lobby: ClassicLobby, socketService: SocketService) {
        super(<Lobby>lobby, socketService);
        this.teams = lobby.getTeams();
        console.log("Started classic game with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void {
        this.drawingTeam = this.selectRandomBinary();
        this.isGuessingOk[this.drawingTeam] = true;
        this.round = 1;
        this.assignRandomDrawingPlayer(0);
        this.assignRandomDrawingPlayer(1);
        this.socketService.getSocket().to(this.id).emit('gameStart', { "player": this.drawingPlayer[this.drawingTeam].username })
        this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
    }

    guessDrawing(username: string, guess: string): void {
        if (this.drawingPlayer[this.drawingTeam].username == username)
            throw Error("Drawing player can not guess his own word")
        if (this.teams[this.drawingTeam].get(username)){
            if(!this.isGuessingOk[this.drawingTeam]){
                throw Error("It's not your turn to guess")
            }
            if(this.currentDrawingName == guess) {
                this.score[this.drawingTeam] += 1;
                this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
                this.setupNextRound();
            }
            else {
                this.isGuessingOk[this.drawingTeam] = false;
                this.isGuessingOk[this.getOpposingTeam()] = true;
            }
        }
        else if (this.teams[this.getOpposingTeam()].get(username)) {
            if(!this.isGuessingOk[this.getOpposingTeam()]){
                throw Error("It's not your turn to guess")
            }
            if(this.currentDrawingName == guess) {
                this.score[this.getOpposingTeam()] += 1;
                this.socketService.getSocket().to(this.id).emit('score', { "score": this.score })
            }
            this.setupNextRound();
        }
        else
            throw Error("User is not part of the game")
    }

    private selectRandomBinary() {
        return Math.floor(Math.random() + 0.5);
    }

    private checkIfTeamHasVirtualPlayer(teamNumber: number): boolean {
        this.teams[teamNumber].forEach((player: Player) =>{
            if(player.isVirtual)
                return true
        })
        return false
    }

    private assignRandomDrawingPlayer(teamNumber: number) {
        const players: Player[] = Array.from(this.teams[teamNumber].values());

        if (!this.checkIfTeamHasVirtualPlayer(teamNumber)) {
            this.drawingPlayer[teamNumber] = players[this.selectRandomBinary()];
        }
        else {
            if (players[0].isVirtual) {
                this.drawingPlayer[teamNumber] = players[1];
            }
            else {
                this.drawingPlayer[teamNumber] = players[0];
            }
        }
    }

    private setupNextRound() {
        if(this.round < 4){
            ++this.round
            this.drawingTeam = this.getOpposingTeam();
            this.changeDrawingPlayer();
            this.socketService.getSocket().to(this.id).emit('newRound', { "player": this.drawingPlayer[this.drawingTeam].username })
        }
        else {
            this.endGame()
        }
    }

    private endGame() {
        this.isGuessingOk = [false, false];
        this.socketService.getSocket().to(this.id).emit('endGame', { "finalScore": this.score})
    }

    private getOpposingTeam(): number {
        if (this.drawingTeam)
            return 0;
        else
            return 1;
    }

    private changeDrawingPlayer() {
        const players: Player[] = Array.from(this.teams[this.drawingTeam].values());

        if (!this.checkIfTeamHasVirtualPlayer(this.drawingTeam)) {
            if(players[0].username == this.drawingPlayer[this.drawingTeam].username)
                this.drawingPlayer[this.drawingTeam] = players[1];
            else
                this.drawingPlayer[this.drawingTeam] = players[0];
        }
    }

    chooseDrawingName(username: string, drawingName: string) {
        if (this.drawingPlayer[this.drawingTeam].username != username)
            throw new Error("User not authorized to select drawing name");
        this.currentDrawingName = drawingName;
    }

    dispatchDrawingEvent(user: BasicUser, event: DrawingEvent){
        if(user.username == this.drawingPlayer[this.drawingTeam].username){
            this.socketService.getSocket().to(this.id).emit('drawingEvent', { "drawingEvent": event});
        }
        else{
            throw new Error("It is not your turn to draw");
        }
    }
}