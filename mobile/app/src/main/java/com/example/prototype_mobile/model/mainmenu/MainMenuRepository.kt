package com.example.prototype_mobile.model.mainmenu


import com.example.prototype_mobile.CreateGame
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.GameInvited
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import org.json.JSONObject


class MainMenuRepository {

    suspend fun createGame(game: CreateGame, isPrivate:Boolean): Result<GameInvited> {
        val mapCreateGame = HashMap<String, String>()
        mapCreateGame["gameType"] = game.gameType!!.type.toString()
        mapCreateGame["gameName"] = game.gameName!!.toString()
        mapCreateGame["difficulty"] = game.gameDifficulty!!.difficulty.toString()

        if(isPrivate) {
            val reponse = HttpRequestDrawGuess.httpRequestPost("/api/games/create/private", mapCreateGame, true)
            val result: Result<GameInvited> = analyseCreateGameAwnser(reponse, game, isPrivate)
            return result
        } else {
            val reponse = HttpRequestDrawGuess.httpRequestPost("/api/games/create/public", mapCreateGame, true)
            val result: Result<GameInvited> = analyseCreateGameAwnser(reponse, game, isPrivate)
            return result
        }
    }

    fun analyseCreateGameAwnser(response: okhttp3.Response, game: CreateGame, isPrivate: Boolean):Result<GameInvited> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            val jsonObject = JSONObject(jsonData)
            val lobbyId = jsonObject.getString("lobbyId")
            if(isPrivate) {
                val lobbyInviteId = jsonObject.getString("lobbyInviteId")
                val gameCreated =
                        GameInvited(gameID = lobbyId.toString(),gameName = game.gameName!!,difficulty = game.gameDifficulty!!,gameType = game.gameType!!, lobbyInvited = lobbyInviteId)
                return Result.Success(gameCreated)
            } else {
                val gameCreated =
                        GameInvited(gameID = lobbyId.toString(),gameName = game.gameName!!,difficulty = game.gameDifficulty!!,gameType = game.gameType!!, lobbyInvited = null)
                return Result.Success(gameCreated)
            }
        }
        else {
            return Result.Error(response.code())
        }

    }
}