package com.example.prototype_mobile.viewmodel.mainmenu.GameList

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository

class MainMenuViewModel(val mainMenuRepository: MainMenuRepository) : ViewModel(){

    fun createGame() {
        mainMenuRepository.createGame()
    }


}