package com.example.prototype_mobile.viewmodel.mainmenu.GameList

enum class SelectedButton(number: Int){
    SEARCH(0),
    CLASSIC(1),
    SPRINT(2),
    COOP(3),
    NONE(4)
}

data class SelectedButtonData(val selection:SelectedButton)