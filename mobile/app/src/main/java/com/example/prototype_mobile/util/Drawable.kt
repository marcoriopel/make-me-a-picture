package com.example.prototype_mobile.util

import com.example.prototype_mobile.R

class Drawable {
    companion object {
        val avatars = arrayOf(R.drawable.avatar0, R.drawable.avatar1, R.drawable.avatar2, R.drawable.avatar3,
                R.drawable.avatar4, R.drawable.avatar5, R.drawable.avatar_v_p_v_player1, R.drawable.avatar_v_player2,
                R.drawable.avatar_v_player3, R.drawable.avatar_v_player4)
        val gameTypeDrawable = arrayOf(R.drawable.icon_classic, R.drawable.icon_solo, R.drawable.icon_hand)
        val gameTypeDrawableWhite = arrayOf(R.drawable.icon_classic_white, R.drawable.icon_solo, R.drawable.icon_hand_white)
        val difficulty = arrayOf(R.drawable.icon_easy_white, R.drawable.icon_medium_white, R.drawable.icon_hard_white)
        val tutorialInfo = arrayOf(R.drawable.menu, R.drawable.lobby, R.drawable.guessing)
    }
}