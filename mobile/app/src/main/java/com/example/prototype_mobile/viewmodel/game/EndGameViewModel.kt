package com.example.prototype_mobile.viewmodel.game

import androidx.lifecycle.ViewModel
import com.example.prototype_mobile.model.game.EndGameRepository

class EndGameViewModel(): ViewModel() {

    val endGameRepo = EndGameRepository.getInstance()!!

    fun upload() {
        endGameRepo.uplaod()
    }

    fun vote(drawingId: String, upvote: Boolean) {
        endGameRepo.vote(drawingId, upvote)
    }

}