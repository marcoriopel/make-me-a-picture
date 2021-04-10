package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.GameHistoric
import com.example.prototype_mobile.R

class GameHistoricAdapter(val context: Context, val gameList: MutableList<GameHistoric>): RecyclerView.Adapter<GameHistoricAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameHistoricAdapter.ViewHolder {
        var view = LayoutInflater.from(context).inflate(R.layout.row_game_profil,parent,false)
        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return gameList.size
    }

    override fun onBindViewHolder(holder: GameHistoricAdapter.ViewHolder, position: Int) {
        val gameData  = gameList[position]
        holder.date.text = gameData.date
        holder.name.text = gameData.name
        holder.mode.text = gameData.mode
        holder.team1.text = gameData.team1
        holder.team2.text = gameData.team2
        holder.score.text = gameData.score
    }

    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val date = itemView.findViewById<TextView>(R.id.date)
        val name = itemView.findViewById<TextView>(R.id.name)
        val mode = itemView.findViewById<TextView>(R.id.mode)
        val team1 = itemView.findViewById<TextView>(R.id.team1)
        val team2 = itemView.findViewById<TextView>(R.id.team2)
        val score = itemView.findViewById<TextView>(R.id.score)
    }
}