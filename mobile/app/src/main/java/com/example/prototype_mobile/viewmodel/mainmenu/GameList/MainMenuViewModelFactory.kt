package com.example.prototype_mobile.viewmodel.mainmenu.GameList

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository

//Communicate data between fragments
class MainMenuViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GameListViewModel::class.java)) {
            return MainMenuViewModel(MainMenuRepository()) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}