package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.R
import com.example.prototype_mobile.util.Drawable
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.GameListViewModel


class GameListAdapter(val context: Context, val gameList: MutableList<Game>, val viewModel: GameListViewModel): RecyclerView.Adapter<GameListAdapter.ViewHolder>() {
    var lastGameChecked: View? = null

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameListAdapter.ViewHolder {
        val view = LayoutInflater.from(context).inflate(R.layout.row_game_list,parent,false)
        return ViewHolder(view!!)
    }

    override fun getItemCount(): Int {
        return gameList.size
    }

    override fun onBindViewHolder(holder: GameListAdapter.ViewHolder, position: Int) {
        val gameData  = gameList[position]
        holder.gameName.text = gameData.gameName
        holder.gameDifficulty.setImageResource(Drawable.difficulty[gameData.difficulty.difficulty])
        holder.gameType.setImageResource(Drawable.gameTypeDrawableWhite[gameData.gameType.type])
        val joinButton = holder.view.findViewById<Button>(R.id.gamelist_join)

        holder.view.setOnClickListener{
            if (it != lastGameChecked) {
                closeLastGame()
                viewModel.listenLobby(gameData.gameID)
                lastGameChecked = it
            }
            val section1 = holder.view.findViewById<LinearLayout>(R.id.gamelist_player_section_1)
            val section2 = holder.view.findViewById<LinearLayout>(R.id.gamelist_player_section_2)
            if(section1.visibility == View.GONE) {
                section1.visibility = View.VISIBLE
                section2.visibility = View.VISIBLE
                joinButton.visibility = View.VISIBLE
                it.setBackgroundResource(R.drawable.button_lobby_expended)

            } else {
                section1.visibility = View.GONE
                section2.visibility = View.GONE
                joinButton.visibility = View.GONE
                it.setBackgroundResource(R.drawable.button_lobby)
            }
        }

        joinButton.setOnClickListener {
            viewModel.joinLobby(gameData)
        }
    }

    fun closeLastGame() {
        if (lastGameChecked != null) {
            val section1 = lastGameChecked!!.findViewById<LinearLayout>(R.id.gamelist_player_section_1)
            val section2 = lastGameChecked!!.findViewById<LinearLayout>(R.id.gamelist_player_section_2)
            val joinButton = lastGameChecked!!.findViewById<Button>(R.id.gamelist_join)
            lastGameChecked!!.setBackgroundResource(R.drawable.button_lobby)
            section1.visibility = View.GONE
            section2.visibility = View.GONE
            joinButton.visibility = View.GONE
        }

    }

    fun updatePlayers(lobbyPlayers: LobbyPlayers) {
        if (lastGameChecked != null) {
            val avatarList = arrayOf(
                lastGameChecked!!.findViewById<ImageView>(R.id.gamelist_avatar0),
                lastGameChecked!!.findViewById<ImageView>(R.id.gamelist_avatar1),
                lastGameChecked!!.findViewById<ImageView>(R.id.gamelist_avatar2),
                lastGameChecked!!.findViewById<ImageView>(R.id.gamelist_avatar3))
            val usernameList = arrayOf(
                lastGameChecked!!.findViewById<TextView>(R.id.gamelist_username0),
                lastGameChecked!!.findViewById<TextView>(R.id.gamelist_username1),
                lastGameChecked!!.findViewById<TextView>(R.id.gamelist_username2),
                lastGameChecked!!.findViewById<TextView>(R.id.gamelist_username3))
            var i = 0
            for(player in lobbyPlayers.players) {
                usernameList[i].text = player.username
                avatarList[i].setImageResource(Drawable.avatars[player.avatar])
                i++
            }
            while (i < 4) {
                usernameList[i].text = context.getString(R.string.available)
                i++
            }
        }
    }
    inner class ViewHolder(itemView : View):  RecyclerView.ViewHolder(itemView) {
        val view = itemView
        val gameName = itemView.findViewById<TextView>(R.id.gamelist_name)
        val gameDifficulty = itemView.findViewById<ImageView>(R.id.gamelist_difficulty)
        val gameType = itemView.findViewById<ImageView>(R.id.gamelist_type)
    }
}