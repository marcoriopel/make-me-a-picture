package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.R

class GameListAdapter(val context: Context, val gameList: MutableList<Game>): RecyclerView.Adapter<GameListAdapter.ViewHolder>() {
    val difficultyDrawable = arrayOf(R.drawable.icon_easy_white, R.drawable.icon_medium_white, R.drawable.icon_hard_white)
    val gameTypeDrawable = arrayOf(R.drawable.icon_classic_white, R.drawable.icon_solo, R.drawable.icon_solo)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameListAdapter.ViewHolder {
        var view = LayoutInflater.from(context).inflate(R.layout.row_game_list,parent,false)
        view.setOnClickListener{
            val section1 = view.findViewById<LinearLayout>(R.id.gamelist_player_section_1)
            val section2 = view.findViewById<LinearLayout>(R.id.gamelist_player_section_2)
            val joinButton = view.findViewById<Button>(R.id.gamelist_join)
            if(section1.visibility == View.GONE) {
                section1.visibility = View.VISIBLE
                section2.visibility = View.VISIBLE
                joinButton.visibility = View.VISIBLE
            } else {
                section1.visibility = View.GONE
                section2.visibility = View.GONE
                joinButton.visibility = View.GONE
            }
        }
        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return gameList.size
    }

    override fun onBindViewHolder(holder: GameListAdapter.ViewHolder, position: Int) {
        val gameData  = gameList[position]
        holder.gameName.setText(gameData.gameName)
        holder.gameDifficulty.setImageResource(difficultyDrawable[gameData.difficulty.difficulty])
        holder.gameType.setImageResource(gameTypeDrawable[gameData.gameType.type])

        }

    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val gameName = itemView.findViewById<TextView>(R.id.gamelist_name)
        val gameDifficulty = itemView.findViewById<ImageView>(R.id.gamelist_difficulty)
        val gameType = itemView.findViewById<ImageView>(R.id.gamelist_type)
        val avatarList = arrayOf(
            itemView.findViewById<ImageView>(R.id.gamelist_avatar0),
            itemView.findViewById<ImageView>(R.id.gamelist_avatar1),
            itemView.findViewById<ImageView>(R.id.gamelist_avatar2),
            itemView.findViewById<ImageView>(R.id.gamelist_avatar3))
        val usernameList = arrayOf(
            itemView.findViewById<TextView>(R.id.gamelist_username0),
            itemView.findViewById<TextView>(R.id.gamelist_username1),
            itemView.findViewById<TextView>(R.id.gamelist_username2),
            itemView.findViewById<TextView>(R.id.gamelist_username3))
    }
}