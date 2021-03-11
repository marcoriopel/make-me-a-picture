package com.example.prototype_mobile.view.game

import android.content.Context
import android.graphics.Color.rgb
import android.graphics.drawable.ColorDrawable
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.core.content.ContextCompat
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentChatBinding
import com.example.prototype_mobile.databinding.FragmentToolsBinding
import com.example.prototype_mobile.viewmodel.connection.login.LoginViewModel
import com.example.prototype_mobile.viewmodel.connection.login.LoginViewModelFactory
import com.example.prototype_mobile.viewmodel.game.ToolsViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsViewModelFactory
import com.jaredrummler.android.colorpicker.ColorPickerDialog.TYPE_CUSTOM
import com.jaredrummler.android.colorpicker.ColorPickerDialogListener
import java.util.*

class ToolsFragment : Fragment() {

    private lateinit var binding: FragmentToolsBinding
    private var isGrid = false
    private var isEraser = false
    var primaryColor = rgb(0,0,0)
    var colorList:IntArray = intArrayOf(rgb(255,0,0),rgb(0,255,0),rgb(0,0,255), rgb(255,0,255))
    var secondaryButtons:Vector<Button> = Vector<Button>()
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
        viewModel.setColor(primaryColor)

    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentToolsBinding.bind(view)
        binding.buttonPencil.setOnClickListener { pen() }
        binding.buttonEraser.setOnClickListener { eraser() }
        binding.buttonGrid.setOnClickListener { toggleGrid() }
        binding.buttonUndo.setOnClickListener { viewModel.undo() }
        binding.buttonRedo.setOnClickListener { viewModel.redo() }
        binding.buttonPencil.setImageResource(R.drawable.button_pencil_selected)
        binding.primaryColor.setOnClickListener{
            openColorPicker()
        }
        updateButtonColor(primaryColor)
        secondaryButtons.add(binding.secondary1)
        secondaryButtons.add(binding.secondary2)
        secondaryButtons.add(binding.secondary3)
        secondaryButtons.add(binding.secondary4)
        populateSecondaryColor(colorList)

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

    private fun openColorPicker() {
        activity?.let{
            com.jaredrummler.android.colorpicker.ColorPickerDialog.newBuilder().setColor(primaryColor)
                .setAllowPresets(false).setDialogType(com.jaredrummler.android.colorpicker.ColorPickerDialog.TYPE_CUSTOM).setDialogTitle(R.string.colorPickerToolTitle).show(it)

        }
    }

    fun updateButtonColor(color: Int) {
        binding.primaryColor.background =  ColorDrawable(color)
        binding.secondary1.background =ColorDrawable(color)
    }
    fun populateSecondaryColor(colors:IntArray){
        secondaryButtons.forEachIndexed { i, element ->
            element.background =  ColorDrawable(colors[i])
        }
    }



}