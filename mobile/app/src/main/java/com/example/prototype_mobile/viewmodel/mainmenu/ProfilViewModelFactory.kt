package com.example.prototype_mobile.viewmodel.mainmenu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.model.mainmenu.MainMenuRepository
import com.example.prototype_mobile.model.mainmenu.ProfilRepository

class ProfilViewModelFactory : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ProfilViewModel::class.java)) {
            return ProfilViewModel(ProfilRepository()) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}