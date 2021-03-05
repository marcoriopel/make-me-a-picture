package com.example.prototype_mobile.viewmodel.mainmenu.GameList

enum class SelectedButton(number: Int){
    CLASSIC(0),
    SPRINT(1),
    COOP(2),
    NONE(3),
    SEARCH(4)
}

data class SelectedButtonData(val selection:SelectedButton)