package com.example.prototype_mobile.model.mainmenu

import com.example.prototype_mobile.Game
import com.example.prototype_mobile.Message
import com.example.prototype_mobile.model.HttpRequestDrawGuess
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.sign_up.model.GameDifficulty
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import okhttp3.Response
import org.json.JSONObject

class GameListRepository {

    var gameList: MutableList<Game> = mutableListOf()

    suspend fun getGameList(): Result<MutableList<Game>> {
        val loginRepo = LoginRepository.getInstance()
        val token = loginRepo!!.user!!.token
        val map = HashMap<String, String>()
        map["authorization"] = token

        gameList.clear()
        val response = HttpRequestDrawGuess.httpRequest("/api/games/list", map)
        return analyseGameListAnswer(response)
    }

    fun analyseGameListAnswer(response: Response): Result<MutableList<Game>> {
        val jsonData: String = response.body()!!.string()
        if(response.code() == ResponseCode.OK.code) {
            val jObject = JSONObject(jsonData)
            val jArray = jObject.getJSONArray("lobbies")
            for (i in 0 until jArray.length()) {
                val gameJson = jArray.getJSONObject(i)
                val game = Game(
                    gameJson.getString("id"),
                    gameJson.getString("gameName"),
                    GameDifficulty.values()[gameJson.getInt("difficulty")],
                    GameType.values()[gameJson.getInt("gameType")])
                gameList.add(game)
            }
            return Result.Success(gameList)
        } else {
            return Result.Error(response.code())
        }
    }
}