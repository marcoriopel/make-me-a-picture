package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import android.os.Bundle
import android.util.AttributeSet
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.core.widget.addTextChangedListener
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameListBinding
import com.example.prototype_mobile.model.connection.sign_up.model.GameFilter
import com.example.prototype_mobile.ressources.LinearLayoutManagerWrapper
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.GameListViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.GameListViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread

class GameListFragment : Fragment() {
    companion object {
        fun newInstance() = GameListFragment()
    }

    var gameList: MutableList<Game> = mutableListOf()
    lateinit var gameListAdapter: GameListAdapter
    private lateinit var binding: FragmentGameListBinding
    private lateinit var gameListViewModel: GameListViewModel
    var lastFilterClicked: Button? = null

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
        val layoutManager: RecyclerView.LayoutManager = LinearLayoutManagerWrapper(context)
        recyclerView.layoutManager = layoutManager

        // define an adapter
        gameListAdapter = GameListAdapter(view.context, gameList, gameListViewModel)
        recyclerView.adapter = gameListAdapter
        binding = FragmentGameListBinding.bind(view)

        gameListViewModel.gameListResult.observe(viewLifecycleOwner, Observer {
            val gameListResult = it ?: return@Observer
            if (gameListResult.error != null) {
                showLoadingFailed(view.context, gameListResult.error)
            }

            gameList.clear()

            if (gameListResult.success != null) {
                addItemToRecyclerView(gameListResult.success)
            }
        })

        gameListViewModel.joinLobbyResult.observe(viewLifecycleOwner, Observer {
            val joinLobbyResult = it ?: return@Observer
            if (joinLobbyResult.error != null) {
                showLoadingFailed(view.context, joinLobbyResult.error)
            }
        })

        gameListViewModel.lobbyPlayers.observe(viewLifecycleOwner, Observer {
            val lobbyPlayers = it ?: return@Observer
            gameListAdapter.updatePlayers(lobbyPlayers)
        })

        setFilters()
        gameListViewModel.getGameList()

    }

    private fun addItemToRecyclerView(game: MutableList<Game>) {
        runOnUiThread {
            gameList.addAll(game)
            gameListAdapter.notifyDataSetChanged()
        }
        lastFilterClicked?.isClickable = true
    }

    private fun showLoadingFailed(context: Context, @StringRes errorString: Int) {
        val toast = Toast.makeText(context, errorString, Toast.LENGTH_LONG)
        toast.setGravity(Gravity.CENTER_VERTICAL, 0, 0)
        toast.show()
    }


    private fun setFilters() {
        binding.classicFilter.isActivated = true
        binding.classicFilter.setOnClickListener{
            binding.classicFilter.isClickable = false
            it.isActivated = !it.isActivated
            lastFilterClicked = binding.classicFilter
            gameListViewModel.setFilter(GameFilter.CLASSIC, it.isActivated)
        }
        binding.coopFilter.isActivated = true
        binding.coopFilter.setOnClickListener{
            binding.coopFilter.isClickable = false
            it.isActivated = !it.isActivated
            lastFilterClicked = binding.coopFilter
            gameListViewModel.setFilter(GameFilter.COOP, it.isActivated)
        }
        binding.easyFilter.isActivated = true
        binding.easyFilter.setOnClickListener{
            it.isClickable = false
            it.isActivated = !it.isActivated
            lastFilterClicked = binding.easyFilter
            gameListViewModel.setFilter(GameFilter.EASY, it.isActivated)
        }
        binding.mediumFilter.isActivated = true
        binding.mediumFilter.setOnClickListener{
            binding.mediumFilter.isClickable = false
            it.isActivated = !it.isActivated
            lastFilterClicked = binding.mediumFilter
            gameListViewModel.setFilter(GameFilter.MEDIUM, it.isActivated)
        }
        binding.hardFilter.isActivated = true
        binding.hardFilter.setOnClickListener{
            binding.hardFilter.isClickable = false
            it.isActivated = !it.isActivated
            lastFilterClicked = binding.hardFilter
            gameListViewModel.setFilter(GameFilter.HARD, it.isActivated)
        }
        binding.refresh.setOnClickListener{
            binding.refresh.isClickable = false
            lastFilterClicked = binding.refresh
            gameListViewModel.getGameList()
        }
       binding.searchgame.addTextChangedListener {
           gameListViewModel.filterByGameName(it.toString())
       }
    }
}