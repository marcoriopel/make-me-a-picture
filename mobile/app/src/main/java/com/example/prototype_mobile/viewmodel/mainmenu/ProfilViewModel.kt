package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.prototype_mobile.*
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.mainmenu.ProfilRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception
import java.util.*

class ProfilViewModel(val profilRepository: ProfilRepository): ViewModel() {

    private val _username = MutableLiveData<String>()
    val username: LiveData<String> = _username

    private val _avatar = MutableLiveData<Int>()
    val avatar: LiveData<Int> = _avatar

    private val _name = MutableLiveData<String>()
    val name: LiveData<String> = _name

    private val _surname = MutableLiveData<String>()
    val surname: LiveData<String> = _surname

    private val _gameHistoric = MutableLiveData<MutableList<GameHistoric>>()
    val gameHistoric: LiveData<MutableList<GameHistoric>> = _gameHistoric

    private val _connection = MutableLiveData<MutableList<Connection>>()
    val connection: LiveData<MutableList<Connection>> = _connection

    private val _stats = MutableLiveData<Stats>()
    val stats: LiveData<Stats> = _stats

    fun getProfilInfo() {
        _username.value = LoginRepository.getInstance()!!.user!!.username
        _avatar.value = LoginRepository.getInstance()!!.user!!.avatar
        viewModelScope.launch((Dispatchers.IO)) {
            var result = try {
                profilRepository.getProfilInfo()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }

            if (result is Result.Success) {
                _name.postValue(result.data.name)
                _surname.postValue(result.data.surname)
                val gameList = mutableListOf<GameHistoric>()
                result.data.games.forEach { gameList.add(processGameLog(it)) }
                _gameHistoric.postValue(gameList)
                val connectionList = mutableListOf<Connection>()
                result.data.logs.forEach { connectionList.add(processConnectionLog(it))}
                _connection.postValue(connectionList)
                _stats.postValue(result.data.stats)
            }
        }
    }

    fun processConnectionLog(connection: Log): Connection {
        val action = if (connection.isLogin) "Connexion" else "Déconnexion"
        return Connection(processTimestamp(connection.timestamp), action)
    }

    fun processGameLog(game: GameLog): GameHistoric {
        val date = processTimestamp(game.start)
        var mode: String = ""
        var team1: String = ""
        var team2: String = ""
        var score: String = ""

        when(game.gameType) {
            0 -> {
                mode = "Classique"
                for(player in game.players) {
                    if (player.team == 0) {
                        team1 += (player.username + "\n")
                    } else {
                        team2 += (player.username + "\n")
                    }
                }
                score = game.score[0].toString() + ":" + game.score[1].toString()
            }

            1 -> {
                mode = "Solo"
                if( game.players.size > 0) {
                    team1 = game.players[0].username
                }
                score = game.score[0].toString()
            }
            2-> {
                mode = "Coop"
                team1 = game.players[0].username + "\n" + game.players[1].username
                for (i in 2..(game.players.size - 1)) {
                    team2 += game.players[i].username + "\n"
                }
            }
        }

        return GameHistoric(date, game.gameName, mode, team1, team2, score)
    }

    private fun processTimestamp(timestamp: Long): String {
        val date = Date(timestamp)
        val cal = Calendar.getInstance()
        cal.time = date

        var tmpHour: Int = cal.get(Calendar.HOUR_OF_DAY)
        if (tmpHour < 0) { tmpHour += 24 }
        val hours = if (tmpHour.toString().length == 1) "0" + tmpHour.toString() else tmpHour.toString()
        val minutes = if(cal.get(Calendar.MINUTE).toString().length == 1) "0" + cal.get(Calendar.MINUTE).toString() else cal.get(
            Calendar.MINUTE).toString()
        val seconds = if(cal.get(Calendar.SECOND).toString().length == 1) "0" + cal.get(Calendar.SECOND).toString() else cal.get(
            Calendar.SECOND).toString()
        val day = if(cal.get(Calendar.DAY_OF_MONTH).toString().length == 1) "0" + cal.get(Calendar.DAY_OF_MONTH).toString() else cal.get(
            Calendar.DAY_OF_MONTH).toString()
        val month = if(cal.get(Calendar.MONTH).toString().length == 1) "0" + cal.get(Calendar.MONTH).toString() else cal.get(
            Calendar.MONTH).toString()
        val year = if(cal.get(Calendar.YEAR).toString().length == 1) "0" + cal.get(Calendar.YEAR).toString() else cal.get(
            Calendar.YEAR).toString()
        return day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds
    }

}