package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.Nullable
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.Player
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentLobbyBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.util.Drawable
import com.example.prototype_mobile.viewmodel.mainmenu.LobbyViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.LobbyViewModelFactory
import org.jetbrains.anko.image

// the fragment initialization parameters
private const val GAME_NAME = "param1"
private const val GAME_TYPE = "param2"

class LobbyFragment : Fragment() {

    private var game_name: String? = null
    private var game_type: GameType? = null
    private lateinit var binding: FragmentLobbyBinding
    private lateinit var lobbyViewModel: LobbyViewModel
    private lateinit var avatarList: Array<ImageView>
    private lateinit var usernameList: Array<TextView>
    var team1HasVirtualPlayer = false
    var team2HasVirtualPlayer = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
            game_name = it.getString(GAME_NAME)
            game_type = GameType.values()[(it.getInt(GAME_TYPE))]
        }
        lobbyViewModel = ViewModelProvider(this, LobbyViewModelFactory()).get(LobbyViewModel::class.java)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_lobby, container, false)
    }

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = FragmentLobbyBinding.bind(view)
        binding.lobbyGameName.text = game_name

        binding.lobbyGameLogo.setImageResource(Drawable.gameTypeDrawable[game_type!!.type])

        lobbyViewModel.lobbyPlayers.observe(viewLifecycleOwner, Observer {
            val lobbyPlayers = it ?: return@Observer
            updatePlayers(lobbyPlayers)
        })

        usernameList = arrayOf(
                binding.lobbyPlayer1Name,
                binding.lobbyPlayer2Name,
                binding.lobbyPlayer3Name,
                binding.lobbyPlayer4Name)

        avatarList = arrayOf(
                binding.lobbyPlayer1Avatar,
                binding.lobbyPlayer2Avatar,
                binding.lobbyPlayer3Avatar,
                binding.lobbyPlayer4Avatar)

        binding.lobbyVirtual1.setImageResource(R.drawable.ic_add_circle_white_18dp)
        binding.lobbyVirtual1.setOnClickListener {
            if (!team1HasVirtualPlayer) {
                lobbyViewModel.addVirtualPlayer(0)
            } else {
                lobbyViewModel.removeVirtualPlayer(0, binding.lobbyPlayer2Name.text as String)
            }
            binding.lobbyVirtual1.isClickable = false
        }
        binding.lobbyVirtual2.setOnClickListener {
            if (!team2HasVirtualPlayer) {
                lobbyViewModel.addVirtualPlayer(1)
            } else {
                lobbyViewModel.removeVirtualPlayer(1, binding.lobbyPlayer4Name.text as String)
            }
            binding.lobbyVirtual2.isClickable = false
        }
    }

    fun updatePlayers(lobbyPlayers: LobbyPlayers) {
        when(game_type) {
            GameType.CLASSIC -> updatePlayersClassic(lobbyPlayers)
            GameType.SOLO -> updatePlayerSolo(lobbyPlayers)
            GameType.COOP -> updatePlayersCoop(lobbyPlayers)
        }

        if (lobbyPlayers.players.size == 4) {
            binding.start.isActivated = true
            binding.start.isClickable = true
        } else {
            binding.start.isActivated = false
            binding.start.isClickable = false
        }
    }

    fun updatePlayersClassic(lobbyPlayers: LobbyPlayers) {
        var team1Count = 0
        var team2Count = 2 // Starts at player 3
        val realPlayers = lobbyPlayers.players.filter{ it.avatar < 6 } as MutableList<Player>
        val virtualPlayers = lobbyPlayers.players.filter{ it.avatar > 5 } as MutableList<Player>
        binding.lobbyVirtual1.visibility = View.GONE
        binding.lobbyVirtual2.visibility = View.GONE
        team1HasVirtualPlayer = false
        team2HasVirtualPlayer = false
        for(player in realPlayers) {
            if(player.team == 0) {
                avatarList[team1Count].setImageResource(Drawable.avatars[player.avatar])
                usernameList[team1Count].text = player.username
                team1Count++
            }
            if(player.team == 1) {
                avatarList[team2Count].setImageResource(Drawable.avatars[player.avatar])
                usernameList[team2Count].text = player.username
                team2Count++
            }
        }
        if(team1Count < 1) {
            usernameList[team1Count].text = getString(R.string.available)
            team1Count++
        }

        if(team2Count < 3) {
            usernameList[team2Count].text = getString(R.string.available)
            team2Count++
        }

        for(player in virtualPlayers) {
            if(player.team == 0) {
                avatarList[1].setImageResource(Drawable.avatars[player.avatar])
                usernameList[1].text = player.username
                binding.lobbyVirtual1.visibility = View.VISIBLE
                binding.lobbyVirtual1.isClickable = true
                binding.lobbyVirtual1.setImageResource(R.drawable.ic_remove_circle_white_18dp)
                team1HasVirtualPlayer = true
                team1Count++
            }
            if(player.team == 1) {
                avatarList[3].setImageResource(Drawable.avatars[player.avatar])
                usernameList[3].text = player.username
                binding.lobbyVirtual2.visibility = View.VISIBLE
                binding.lobbyVirtual2.isClickable = true
                binding.lobbyVirtual2.setImageResource(R.drawable.ic_remove_circle_white_18dp)
                team2HasVirtualPlayer = true
                team2Count++
            }
        }

        if(team1Count < 2) {
            usernameList[team1Count].text = getString(R.string.available)
            binding.lobbyVirtual1.visibility = View.VISIBLE
            binding.lobbyVirtual1.setImageResource(R.drawable.ic_add_circle_white_18dp)
            binding.lobbyVirtual1.isClickable = true
            team1HasVirtualPlayer = false
        }

        if(team2Count < 4) {
            usernameList[team2Count].text = getString(R.string.available)
            binding.lobbyVirtual2.visibility = View.VISIBLE
            binding.lobbyVirtual2.setImageResource(R.drawable.ic_add_circle_white_18dp)
            binding.lobbyVirtual2.isClickable = true
            team2HasVirtualPlayer = false
        }
    }


    fun updatePlayerSolo(lobbyPlayers: LobbyPlayers) {
        binding.start.isActivated = true
        binding.start.isClickable = true
        binding.lobby4playerLayout.visibility = View.GONE
        binding.lobby1playerLayout.visibility = View.VISIBLE
        if(lobbyPlayers.players.size > 0) {
            binding.lobbyPlayerSoloAvatar.setImageResource(Drawable.avatars[lobbyPlayers.players[0].avatar])
            binding.lobbyPlayerSoloName.text = lobbyPlayers.players[0].username
        }
    }

    fun updatePlayersCoop(lobbyPlayers: LobbyPlayers){
        var i = 0
        for(player in lobbyPlayers.players) {
            usernameList[i].text = player.username
            avatarList[i].setImageResource(Drawable.avatars[player.avatar])
            i++
        }

        while (i < 4) {
            usernameList[i].text = getString(R.string.available)
            i++
        }

        binding.lobbyTeam1.visibility = View.GONE
        binding.lobbyTeam2.visibility = View.GONE
    }

    companion object {
        @JvmStatic
        fun newInstance(param1: String, param2: Int) =
                LobbyFragment().apply {
                    arguments = Bundle().apply {
                        putString(GAME_NAME, param1)
                        putInt(GAME_TYPE, param2)
                    }
                }
    }
}