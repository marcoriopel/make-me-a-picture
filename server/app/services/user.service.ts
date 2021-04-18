import { UsersModel } from '@app/models/users.model';
import { UserLogsModel } from '@app/models/user-logs.model';
import { TYPES } from '@app/types';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { GamesModel } from '@app/models/games.model';
import { LeaderboardCategory } from '@app/ressources/variables/stats-variables';

@injectable()
export class UserService {

    constructor(
        @inject(TYPES.UsersModel) private usersModel: UsersModel,
        @inject(TYPES.UserLogsModel) private userLogsModel: UserLogsModel,
        @inject(TYPES.GamesModel) private gamesModel: GamesModel ){
        }

    async addUserToChat(username: string, chatId: string) {
        await this.usersModel.addUserToChat(username, chatId);
    }

    async removeUserFromChat(username: string, chatId: string) {
        await this.usersModel.removeUserFromChat(username, chatId);
    }

    async getPrivateInfo(username: string, res: Response, next: NextFunction) {
        if (!username) {
            res.status(StatusCodes.BAD_REQUEST).send("user does not have valid username");
        }
        try{
            let userInfo = await this.usersModel.getUserInfo(username);
            let userLogs = await this.userLogsModel.getLogs(username);
            let userGames = await this.gamesModel.getGames(username);

            let userStats = {
                'gamesPlayed': userInfo.gamesPlayed, 
                'timePlayed': userInfo.timePlayed,
                'bestSoloScore': userInfo.bestSoloScore,
                'bestCoopScore': userInfo.bestCoopScore,
                'classicWinRatio': userInfo.classicWinRatio,
                'meanGameTime': userInfo.meanGameTime,
                'classicGamesWon': userInfo.classicGamesWon,
                'totalDrawingVotes': userInfo.totalDrawingVotes,
            }

            let privateInfo = {"name" : userInfo.name, "surname" : userInfo.surname, "stats": userStats, "logs": userLogs, "games" : userGames}
            next(privateInfo);
        }
        catch(e){
            res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }

    async getLastMutualGame(username: string, usernameVPlayer: string){
        let mutualGames = await this.gamesModel.getMutualGames(username, usernameVPlayer);
        return mutualGames.pop();
    }

    async getUserStats(username: string){
        let userInfo = await this.usersModel.getUserInfo(username);
        let userStats = {
            'gamesPlayed': userInfo.gamesPlayed, 
            'timePlayed': userInfo.timePlayed,
            'bestSoloScore': userInfo.bestSoloScore,
            'bestCoopScore': userInfo.bestCoopScore,
            'classicWinRatio': userInfo.classicWinRatio,
            'meanGameTime': userInfo.meanGameTime,
            'classicGamesWon': userInfo.classicGamesWon,
            'totalDrawingVotes': userInfo.totalDrawingVotes,
        }
        return userStats;
    }

    async getTop10(req: Request, res: Response, next: NextFunction) {
        if (req.query.category == undefined){
            res.status(StatusCodes.BAD_REQUEST).send("Leaderboard category is undefined");
        }
        try{
            switch(Number(req.query.category)){
                case LeaderboardCategory.BEST_CLASSIC_WIN_RATIO:
                    next(await this.usersModel.getTop10ClassicWinRatio());
                    break;
                case LeaderboardCategory.BEST_COOP_SCORE:
                    next(await this.usersModel.getTop10BestCoopScore());
                    break;
                case LeaderboardCategory.BEST_SOLO_SCORE:
                    next(await this.usersModel.getTop10BestCSoloScore());
                    break;
                case LeaderboardCategory.MOST_TIME_PLAYED:
                    next(await this.usersModel.getTop10MostTimePlayed());
                    break;
                case LeaderboardCategory.MOST_GAMES_PLAYED:
                    next(await this.usersModel.getTop10MostGamesPlayed());
                    break;
                case LeaderboardCategory.MOST_CLASSIC_GAMES_WON:
                    next(await this.usersModel.getTop10MostClassicGamesWon());
                    break;
                case LeaderboardCategory.MOST_UPVOTES:
                    next(await this.usersModel.getTop10MostUpvotes());
                    break;
                default:
                    res.status(StatusCodes.BAD_REQUEST).send("Leaderboard category does not exist");
            }
        }
        catch(e){
            res.status(StatusCodes.BAD_REQUEST).send(e.message);
        }
    }
}