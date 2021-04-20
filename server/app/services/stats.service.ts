import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { GamesModel } from '@app/models/games.model';
import { GameTime, GameType } from '@app/ressources/variables/game-variables';

@injectable()
export class StatsService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel,
        @inject(TYPES.GamesModel) private gamesModel: GamesModel ){
    }

    updateStats(gameName: string, gameType: number, players: any, score: number[], startDate: number, endDate: number){
        this.saveGame(gameName, gameType, players, score, startDate, endDate)
        let nonVirtualPlayers : any = Array.from(players);
        if(gameType == GameType.CLASSIC){
            for(let i = 0; i < nonVirtualPlayers.length; ++i){
                if(nonVirtualPlayers[i].isVirtual){
                    nonVirtualPlayers.splice(i, 1);
                }
            }
        }
        else{
            nonVirtualPlayers.pop();
        }
        for(let player of nonVirtualPlayers){
            this.updateUserStats(gameName, gameType, player, score, startDate, endDate)
        }
    }

    private saveGame(gameName: string, gameType: number, players: any, score: any, startDate: number, endDate: number){
        this.gamesModel.setGameInfo(gameName, gameType, players, score, startDate, endDate)
    }

    private async updateUserStats(gameName: string, gameType: number, player: any, score: number[], startDate: number, endDate: number){
        let userInfo = await this.usersModel.getUserInfo(player.username);

        if(gameType == GameType.CLASSIC){
            if(score[player.team] > score[this.getOpposingTeam(player.team)]){
                ++userInfo.classicGamesWon;
            }
            userInfo.classicWinRatio = userInfo.classicGamesWon / (++userInfo.classicGamesPlayed);
        }
        else if(gameType == GameType.SOLO && score[0] > userInfo.bestSoloScore){
            userInfo.bestSoloScore = score[0];
        }
        else if(gameType == GameType.COOP && score[0] > userInfo.bestCoopScore){
            userInfo.bestCoopScore = score[0];
        }

        ++userInfo.gamesPlayed;
        userInfo.timePlayed += endDate - startDate;
        userInfo.meanGameTime = userInfo.timePlayed/userInfo.gamesPlayed;

        this.usersModel.updateUserStats(userInfo)
    }

    private getOpposingTeam(teamNumber: number): number{
        if(teamNumber == 0){
            return 1;
        }
        else if(teamNumber == 1){
            return 0;
        }
        else {
            return null;
        }
    }
}