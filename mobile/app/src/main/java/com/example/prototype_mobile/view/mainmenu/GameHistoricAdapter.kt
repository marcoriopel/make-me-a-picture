package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.R

class GameHistoricAdapter(val context: Context, val gameList: MutableList<Game>): RecyclerView.Adapter<GameHistoricAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameHistoricAdapter.ViewHolder {
        var view = LayoutInflater.from(context).inflate(R.layout.row_game_list,parent,false)
        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return gameList.size
    }

    override fun onBindViewHolder(holder: GameHistoricAdapter.ViewHolder, position: Int) {

    }

    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val view = itemView
        val gameName = itemView.findViewById<TextView>(R.id.gamelist_name)
        val gameDifficulty = itemView.findViewById<ImageView>(R.id.gamelist_difficulty)
        val gameType = itemView.findViewById<ImageView>(R.id.gamelist_type)
    }
}