package com.example.prototype_mobile.view.mainmenu

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentGameCreationBinding
import com.example.prototype_mobile.databinding.FragmentProfilBinding


class ProfilFragment : Fragment() {

    private lateinit var binding: FragmentProfilBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_profil, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding = FragmentProfilBinding.bind(view)
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

    companion object {
        @JvmStatic
        fun newInstance() =
            ProfilFragment()
    }
}