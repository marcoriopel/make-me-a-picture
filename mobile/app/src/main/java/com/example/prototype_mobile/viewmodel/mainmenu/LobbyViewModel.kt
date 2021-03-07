package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.model.mainmenu.LobbyRepository

class LobbyViewModel:  ViewModel() {
    private val _lobbyPlayers = MutableLiveData<LobbyPlayers>()
    val lobbyPlayers: LiveData<LobbyPlayers> = _lobbyPlayers

    init {
        val lobbyRepository = LobbyRepository.getInstance()!!
        lobbyRepository.lobbyPlayers.observeForever(Observer {
            _lobbyPlayers.value = it ?: return@Observer
        })
    }
}