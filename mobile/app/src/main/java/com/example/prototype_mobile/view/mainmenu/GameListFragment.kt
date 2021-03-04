package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.content.ContextWrapper
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.view.Gravity
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameListBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameFilter
import com.example.prototype_mobile.viewmodel.mainmenu.GameListViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.GameListViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread

class GameListFragment : Fragment() {

    companion object {
        fun newInstance() = GameListFragment()
    }

    var gameList: MutableList<Game> = mutableListOf()
    lateinit var gameListAdapter: GameListAdapter
    private lateinit var binding: FragmentGameListBinding
    private lateinit var gameListViewModel: GameListViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        gameListViewModel = ViewModelProvider(this, GameListViewModelFactory()).get(GameListViewModel::class.java)
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_game_list, container, false)
    }

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recyclerView: RecyclerView = view.findViewById(R.id.recyclerView)
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManager(context)
        recyclerView.layoutManager = layoutManager

        // define an adapter
        gameListAdapter = GameListAdapter(view.context, gameList, gameListViewModel);
        recyclerView.adapter = gameListAdapter
        binding = FragmentGameListBinding.bind(view)

        gameListViewModel.gameListResult.observe(viewLifecycleOwner, Observer {
            val gameListResult = it ?: return@Observer
            if (gameListResult.error != null) {
                showLoadingFailed(view.getContext(), gameListResult.error)
            }

            gameList.clear()
            gameListAdapter.notifyDataSetChanged()

            if (gameListResult.success != null) {
                for (game in gameListResult.success) {
                    addItemToRecyclerView(game)
                }
            }
        })

        gameListViewModel.joinLobbyResult.observe(viewLifecycleOwner, Observer {
            val joinLobbyResult = it ?: return@Observer
            if (joinLobbyResult.error != null) {
                showLoadingFailed(view.getContext(), joinLobbyResult.error)
            }
        })

        gameListViewModel.lobbyPlayers.observe(viewLifecycleOwner, Observer {
            val lobbyPlayers = it ?: return@Observer
            gameListAdapter.updatePlayers(lobbyPlayers)
        })

        setFilters()
        gameListViewModel.getGameList()
    }

    private fun addItemToRecyclerView(game: Game) {
        // Since this function is inside of the listener,
        // You need to do it on UIThread!
        runOnUiThread {
            gameList.add(game)
            gameListAdapter.notifyItemInserted(gameList.size - 1)
        }
    }

    private fun showLoadingFailed(context: Context, @StringRes errorString: Int) {
        val toast = Toast.makeText(context, errorString, Toast.LENGTH_LONG)
        toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
        toast.show()
    }

    private fun setFilters() {
        binding.classicFilter.isActivated = true
        binding.classicFilter.setOnClickListener{
            it.isActivated = !it.isActivated
            gameListViewModel.setFilter(GameFilter.CLASSIC, it.isActivated)
        }
        binding.coopFilter.isActivated = true
        binding.coopFilter.setOnClickListener{
            it.isActivated = !it.isActivated
            gameListViewModel.setFilter(GameFilter.COOP, it.isActivated)
        }
        binding.easyFilter.isActivated = true
        binding.easyFilter.setOnClickListener{
            it.isActivated = !it.isActivated
            gameListViewModel.setFilter(GameFilter.EASY, it.isActivated)
        }
        binding.mediumFilter.isActivated = true
        binding.mediumFilter.setOnClickListener{
            it.isActivated = !it.isActivated
            gameListViewModel.setFilter(GameFilter.MEDIUM, it.isActivated)
        }
        binding.hardFilter.isActivated = true
        binding.hardFilter.setOnClickListener{
            it.isActivated = !it.isActivated
            gameListViewModel.setFilter(GameFilter.HARD, it.isActivated)
        }
        binding.refresh.setOnClickListener{
            gameListViewModel.getGameList()
        }
    }

}