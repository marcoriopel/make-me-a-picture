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
import com.example.prototype_mobile.LobbyPlayers
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentLobbyBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameType
import com.example.prototype_mobile.util.Drawable
import com.example.prototype_mobile.viewmodel.mainmenu.LobbyViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.LobbyViewModelFactory

// the fragment initialization parameters
private const val GAME_NAME = "param1"
private const val GAME_TYPE = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [LobbyFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class LobbyFragment : Fragment() {

    private var game_name: String? = null
    private var game_type: GameType? = null
    private lateinit var binding: FragmentLobbyBinding
    private lateinit var lobbyViewModel: LobbyViewModel
    private lateinit var avatarList: Array<ImageView>
    private lateinit var usernameList: Array<TextView>
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
    }

    fun updatePlayers(lobbyPlayers: LobbyPlayers) {
        when(game_type) {
            GameType.CLASSIC -> updatePlayersClassic(lobbyPlayers)
            GameType.SOLO -> updatePlayerSolo(lobbyPlayers)
            GameType.COOP -> updatePlayersCoop(lobbyPlayers)
        }

        if (lobbyPlayers.players.size == 4) {
            binding.start.isActivated = true
        }
    }

    fun updatePlayersClassic(lobbyPlayers: LobbyPlayers) {
        var team1Count = 0
        var team2Count = 2 // Starts at player 3
        for(player in lobbyPlayers.players) {
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

        while (team1Count < 2) {
            usernameList[team1Count].text = getString(R.string.available)
            team1Count++
        }

        if(team2Count < 4) {
            usernameList[team2Count].text = getString(R.string.available)
            team2Count++
        }
    }

    fun updatePlayerSolo(lobbyPlayers: LobbyPlayers) {
        binding.start.isActivated = true
        binding.lobby4playerLayout.visibility = View.GONE
        binding.lobby1playerLayout.visibility = View.VISIBLE
        binding.lobbyPlayerSoloAvatar.setImageResource(Drawable.avatars[lobbyPlayers.players[0].avatar])
        binding.lobbyPlayerSoloName.text = lobbyPlayers.players[0].username
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
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment LobbyFragment.
         */
        // TODO: Rename and change types and number of parameters
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