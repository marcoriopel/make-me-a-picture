package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.prototype_mobile.Connection
import com.example.prototype_mobile.GameHistoric
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentProfilBinding
import com.example.prototype_mobile.viewmodel.mainmenu.ProfilViewModel


class ProfilFragment : Fragment() {

    var gameHistoricList: MutableList<GameHistoric> = mutableListOf()
    var connectionList: MutableList<Connection> = mutableListOf()
    lateinit var gameHistoricAdapter: GameHistoricAdapter
    lateinit var connectionAdapter: ConnectionAdapter
    private lateinit var binding: FragmentProfilBinding
    private lateinit var profilViewModel: ProfilViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        profilViewModel = ViewModelProvider(this).get(ProfilViewModel::class.java)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_profil, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding = FragmentProfilBinding.bind(view)
        val gameLayoutManager: RecyclerView.LayoutManager = LinearLayoutManager(context)
        binding.gameRecyclerView.layoutManager = gameLayoutManager

        val connectionLayoutManager: RecyclerView.LayoutManager = LinearLayoutManager(context)
        binding.connectionRecyclerView.layoutManager = connectionLayoutManager

        gameHistoricAdapter = GameHistoricAdapter(view.context, gameHistoricList)
        binding.gameRecyclerView.adapter = gameHistoricAdapter

        connectionAdapter = ConnectionAdapter(view.context, connectionList)
        binding.connectionRecyclerView.adapter = connectionAdapter

        addListMetadata()
        val sectionArray = arrayOf(binding.profil1, binding.profil2, binding.statistic1, binding.gameRecyclerView, binding.connectionRecyclerView)
        binding.toggleButtonGroup.addOnButtonCheckedListener { toggleButton, checkedId, isChecked ->
            when(checkedId) {
                R.id.profil -> {
                    sectionArray.forEach { it.visibility = View.GONE }
                    binding.profil1.visibility = View.VISIBLE
                    binding.profil2.visibility = View.VISIBLE
                }
                R.id.statistic-> {
                    sectionArray.forEach { it.visibility = View.GONE }
                    binding.statistic1.visibility = View.VISIBLE
                }
                R.id.game_historic-> {
                    sectionArray.forEach { it.visibility = View.GONE }
                    binding.gameRecyclerView.visibility = View.VISIBLE
                }
                R.id.connection_historic-> {
                    sectionArray.forEach { it.visibility = View.GONE }
                    binding.connectionRecyclerView.visibility = View.VISIBLE
                }
            }
        }
    }

    fun addListMetadata() {
        gameHistoricList.add(GameHistoric("Date", "Nom", "Mode", "Équipe 1", "Équipe 2", "Score"))
        connectionList.add(Connection("Date", "Action"))
        gameHistoricAdapter.notifyDataSetChanged()
        connectionAdapter.notifyDataSetChanged()

    }

    companion object {
        @JvmStatic
        fun newInstance() =
            ProfilFragment()
    }
}