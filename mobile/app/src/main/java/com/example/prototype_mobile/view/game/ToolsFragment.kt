package com.example.prototype_mobile.view.game

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentToolsBinding
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsViewModelFactory

class ToolsFragment : Fragment() {

    private lateinit var binding: FragmentToolsBinding
    private var isGrid = false
    private var isEraser = false

    companion object {
        fun newInstance() = ToolsFragment()
    }

    lateinit var viewModel: ToolsViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.fragment_tools, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this, ToolsViewModelFactory())
            .get(ToolsViewModel::class.java)

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentToolsBinding.bind(view)
        binding.buttonPencil.setOnClickListener { pen() }
        binding.buttonEraser.setOnClickListener { eraser() }
        binding.buttonGrid.setOnClickListener {
            toggleGrid()
            }
        binding.buttonUndo.setOnClickListener { viewModel.undo() }
        binding.buttonRedo.setOnClickListener { viewModel.redo() }
        binding.buttonPencil.setImageResource(R.drawable.button_pencil_selected)
    }

    private fun pen() {
        if (isEraser) {
            binding.buttonPencil.setImageResource(R.drawable.button_pencil_selected)
            binding.buttonEraser.setImageResource(R.drawable.button_eraser)
            viewModel.usePen()
            isEraser = false
        }
    }

    private fun eraser() {
        if (!isEraser) {
            binding.buttonPencil.setImageResource(R.drawable.button_pencil)
            binding.buttonEraser.setImageResource(R.drawable.button_eraser_selected)
            viewModel.useEraser()
            isEraser = true
        }
    }

    private fun toggleGrid() {
        if (isGrid) {
            binding.buttonGrid.setImageResource(R.drawable.button_grid)
            viewModel.deactivateGrid()
        } else {
            binding.buttonGrid.setImageResource(R.drawable.button_grid_selected)
            viewModel.activateGrid()
        }
        isGrid = !isGrid
    }
}