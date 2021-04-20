package com.example.prototype_mobile.viewmodel.mainmenu.GameList

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.game.ToolRepository
import com.example.prototype_mobile.model.mainmenu.GameListRepository
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel

class GameListViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(GameListViewModel::class.java)) {
            return GameListRepository.getInstance(
            )?.let {
                GameListViewModel(
                        gameListRepository = it
                )
            } as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}