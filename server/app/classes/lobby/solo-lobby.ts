import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { VirtualPlayer } from '../virtual-player/virtual-player';
import { Lobby } from './lobby';

@injectable()
export class SoloLobby extends Lobby {
    team1: Map<string, number> = new Map<string, number>();
    vPlayer: VirtualPlayer;
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        this.gameType = GameType.SOLO;
        this.vPlayer = new VirtualPlayer();
        console.log("Created solo game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(user: BasicUser): void{
        if(this.team1.size){
            throw new Error("You have already joined this lobby");
        }
        this.team1.set(user.username, user.avatar);
    }    

    getPlayers(): any{
        let players = [];
        for(let user in this.team1){
            players.push({"user": this.team1[user], "team": 1});
        }
        return players;
    } 

    removePlayer(): void{}
}