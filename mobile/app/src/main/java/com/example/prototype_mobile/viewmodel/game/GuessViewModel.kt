package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.GameRepository

class GuessViewModel : ViewModel() {

    val gameRepo = GameRepository.getInstance()
    
    fun guessDrawing(guess: String) {
        this.gameRepo!!.guessDrawing(guess)
    }

}