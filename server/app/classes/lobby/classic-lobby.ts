import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { GameType } from '@app/ressources/variables/game-variables';
import { injectable } from 'inversify';
import { Lobby } from './lobby';

@injectable()
export class ClassicLobby extends Lobby {
    team1: Map<string, number> = new Map<string, number>();
    team2: Map<string, number> = new Map<string, number>();
    
    constructor(difficulty: number, gameName: string) {
        super(difficulty, gameName);
        this.gameType = GameType.CLASSIC;
        console.log("Created classic game lobby with difficulty: " + this.difficulty + " and name: " + this.gameName);
    }

    startGame(): void{}

    deleteLobby(): void{}

    addPlayer(user: BasicUser): void{
        if(this.team1.has(user.username) || this.team2.has(user.username)){
            throw new Error("You have already joined this lobby");
        }
        if(this.team1.size == 2 && this.team2.size == 2){
            throw new Error("Lobby is full");
        }
        
        if(this.team1.size <= this.team2.size){
            this.team1.set(user.username, user.avatar);
        }
        else{
            this.team2.set(user.username, user.avatar);
        }
    }  

    getPlayers(): any{
        let players = [];
        this.team1.forEach((avatar: number, username:string,  map: Map<string, number>) =>{
            players.push({"username": username, "avatar": avatar, "team": 1});
        })
        this.team2.forEach((avatar: number, username:string,  map: Map<string, number>) =>{
            players.push({"username": username, "avatar": avatar, "team": 2});
        })
        return players;
    } 

    removePlayer(): void{}
}