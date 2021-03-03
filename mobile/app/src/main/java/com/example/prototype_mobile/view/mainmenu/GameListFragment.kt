package com.example.prototype_mobile.view.mainmenu

import android.content.Context
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.view.Gravity
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.Toast
import androidx.annotation.Nullable
import androidx.annotation.StringRes
import androidx.core.content.ContextCompat
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Game
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameListBinding
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.GameListViewModel
import com.example.prototype_mobile.viewmodel.mainmenu.GameList.GameListViewModelFactory
import org.jetbrains.anko.support.v4.runOnUiThread
import java.util.*

class GameListFragment : Fragment() {

    companion object {
        fun newInstance() = GameListFragment()
    }

    var gameList: MutableList<Game> = mutableListOf()
    lateinit var gameListAdapter: GameListAdapter
    private lateinit var binding: FragmentGameListBinding
    private lateinit var gameListViewModel: GameListViewModel
    private var filterGameButtons: Vector<Button> = Vector<Button>()
    private var filterDifficulty: Vector<Button> = Vector<Button>()

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

        // Create game filter list
        filterGameButtons.addElement(binding.classicFilter)
        filterGameButtons.addElement(binding.soloFilter)
        filterGameButtons.addElement(binding.coopFilter)

        filterDifficulty.addElement(binding.easyFilter)
        filterDifficulty.addElement(binding.mediumFilter)
        filterDifficulty.addElement(binding.hardFilter)

        //Create event listener for filters
        binding.classicFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.blue_to_lightblue)
        binding.classicFilter.setOnClickListener {
            binding.classicFilter.isActivated = !binding.classicFilter.isActivated
            disableOtherButtons(binding.classicFilter, filterGameButtons)
        }

        binding.soloFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.green_to_lightgreen)
        binding.soloFilter.setOnClickListener {
            binding.soloFilter.isActivated = !binding.soloFilter.isActivated
            disableOtherButtons(binding.soloFilter, filterGameButtons)
        }
        binding.coopFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.orange_to_lightorange)
        binding.coopFilter.setOnClickListener {
            binding.coopFilter.isActivated = !binding.coopFilter.isActivated
            disableOtherButtons(binding.coopFilter, filterGameButtons)
        }

        // filter difficulty
        binding.easyFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_green)
        binding.easyFilter.setOnClickListener {
            binding.easyFilter.isActivated = !binding.easyFilter.isActivated
            disableOtherButtons(binding.easyFilter, filterDifficulty)
        }
        binding.mediumFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_orange)
        binding.mediumFilter.setOnClickListener {
            binding.mediumFilter.isActivated = !binding.mediumFilter.isActivated
            disableOtherButtons(binding.mediumFilter, filterDifficulty)
        }
        binding.hardFilter.backgroundTintList = ContextCompat.getColorStateList(view.context, R.color.grey_to_red)
        binding.hardFilter.setOnClickListener {
            binding.hardFilter.isActivated = !binding.hardFilter.isActivated
            disableOtherButtons(binding.hardFilter, filterDifficulty)
        }



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

    fun disableOtherButtons(currentButton: Button, buttonGroup: Vector<Button>) {

        for (button in buttonGroup) {
            if (button.id != currentButton.id){
                button.isActivated = false
            }
        }
    }

}