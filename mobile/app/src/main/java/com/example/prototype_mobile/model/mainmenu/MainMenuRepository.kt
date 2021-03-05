package com.example.prototype_mobile.model.mainmenu


import com.example.prototype_mobile.CreateGame
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import org.json.JSONObject


class MainMenuRepository() {




    suspend fun createGame(game: CreateGame): Result<Game> {
        val mapCreateGame = HashMap<String, String>()
        mapCreateGame["gameType"] = game.gameType!!.type.toString()
        mapCreateGame["gameName"] = game.gameName!!.toString()
        mapCreateGame["difficulty"] = game.gameDifficulty!!.difficulty.toString()

        println(mapCreateGame)
        val reponse = HttpRequestDrawGuess.httpRequestPost("/api/games/create", mapCreateGame,true)
        val result:Result<Game> = analyseCreateGameAwnser(reponse, game)

        return result
    }

    fun analyseCreateGameAwnser(response: okhttp3.Response, game: CreateGame):Result<Game> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            val jsonObject = JSONObject(jsonData)
            val Jarray = jsonObject.getString("lobbyId")
            val gameCreated =
                    Game(gameID = Jarray.toString(),gameName = game.gameName!!,difficulty = game.gameDifficulty!!,gameType = game.gameType!!)
            return Result.Success(gameCreated)
        }
        else {
            return Result.Error(response.code())
        }

    }
}