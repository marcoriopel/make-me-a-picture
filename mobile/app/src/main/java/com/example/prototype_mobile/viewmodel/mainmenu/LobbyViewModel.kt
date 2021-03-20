package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.*
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.model.Result
import com.example.prototype_mobile.model.connection.login.LoginRepository
import com.example.prototype_mobile.model.connection.sign_up.model.ResponseCode
import com.example.prototype_mobile.model.game.CanvasRepository
import com.example.prototype_mobile.model.game.GameRepository
import com.example.prototype_mobile.model.mainmenu.LobbyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.lang.Exception

class LobbyViewModel:  ViewModel() {
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    private val _isPlayerDrawing = MutableLiveData<Boolean>()
    val isPlayerDrawing: LiveData<Boolean> = _isPlayerDrawing

    val lobbyRepository: LobbyRepository = LobbyRepository.getInstance()!!
    val gameRepository = GameRepository.getInstance()!!

    init {
        lobbyRepository.lobbyPlayers.observeForever(Observer {
            _lobbyPlayers.value = it ?: return@Observer
            var i = 0
            for(player in _lobbyPlayers.value!!.players) {
                if (player.username.equals(LoginRepository.getInstance()!!.user!!.username)) {
                    if (i < 2) {
                        gameRepository.team = 0
                    } else {
                        gameRepository.team = 1
                    }
                }
                i++
            }
        })

        lobbyRepository.isPlayerDrawing.observeForever(Observer {
            _isPlayerDrawing.value = it ?: return@Observer
            gameRepository.setIsPlayerDrawing(it)
            gameRepository.gameId = lobbyRepository.currentListenLobby
        })

        // Initialize Singleton
        GameRepository.getInstance()
    }

    fun addVirtualPlayer(team: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.addVirtualPlayer(team)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }

    fun removeVirtualPlayer(team: Int, username: String) {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.removeVirtualPlayer(team, username)
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }

    fun startGame() {
        viewModelScope.launch(Dispatchers.IO) {
            try {
                lobbyRepository.startGame()
            } catch (e: Exception) {
                Result.Error(ResponseCode.BAD_REQUEST.code)
            }
        }
    }
    fun resetData() {
        lobbyRepository.resetData()

    }
}