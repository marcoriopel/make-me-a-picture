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
        gameListAdapter = GameListAdapter(view.context, gameList);
        recyclerView.adapter = gameListAdapter
        binding = FragmentGameListBinding.bind(view)

        gameListViewModel.gameListResult.observe(viewLifecycleOwner, Observer {
            val gameListResult = it ?: return@Observer
            if (gameListResult.error != null) {
                showLoadingFailed(view.getContext(), gameListResult.error)
            }

            if (gameListResult.success != null) {
                for (game in gameListResult.success) {
                    addItemToRecyclerView(game)
                }
            }
        })

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
}