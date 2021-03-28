import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { GamesModel } from '@app/models/games.model';
import { BasicUser } from '@app/ressources/interfaces/user.interface';
import { GameTime, GameType } from '@app/ressources/variables/game-variables';

@injectable()
export class StatsService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel,
        @inject(TYPES.GamesModel) private gamesModel: GamesModel ){
    }

    updateStats(gameName: string, gameType: number, players: any, score: any, startDate: number, endDate: number){
        this.saveGame(gameName, gameType, players, score, startDate, endDate)
        if(gameType == GameType.CLASSIC){
            for(let i = 0; i < players.length; ++i){
                if(players[i].isVirtual){
                    players.splice(i, 1);
                }
            }
        }
        for(let player of players){
            this.updateUserStats(gameName, gameType, player, score, startDate, endDate)
        }
    }

    private saveGame(gameName: string, gameType: number, players: any, score: any, startDate: number, endDate: number){
        this.gamesModel.setGameInfo(gameName, gameType, players, score, startDate, endDate)
    }

    private async updateUserStats(gameName: string, gameType: number, player: any, score: any, startDate: number, endDate: number){
        let userInfo = await this.usersModel.getUserInfo(player.username);

        if(gameType == GameType.CLASSIC){
            let gamesWon = userInfo.classicWinRatio * userInfo.gamesPlayed;
            if(score[player.team] > score[this.getOpposingTeam(player.team)]){
                ++gamesWon;
            }
            userInfo.classicWinRatio = gamesWon / (userInfo.gamesPlayed + 1);
        }
        else if(gameType == GameType.SOLO && score > userInfo.bestSoloScore){
            userInfo.bestSoloScore = score;
        }
        else if(gameType == GameType.COOP && score > userInfo.bestCoopScore){
            userInfo.bestCoopScore = score;
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