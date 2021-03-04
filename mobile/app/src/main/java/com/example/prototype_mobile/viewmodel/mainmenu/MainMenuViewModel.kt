package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.model.mainmenu.LobbyRepository

class MainMenuViewModel : ViewModel()   {
    val lobbyRepository: LobbyRepository

    private val _lobbyJoined = MutableLiveData<Game>()
    val lobbyJoined: LiveData<Game> = _lobbyJoined

    init {
        lobbyRepository = LobbyRepository.getInstance()!!

        lobbyRepository.lobbyJoined.observeForever(Observer {
            _lobbyJoined.value = it ?: return@Observer
        })
    }
}