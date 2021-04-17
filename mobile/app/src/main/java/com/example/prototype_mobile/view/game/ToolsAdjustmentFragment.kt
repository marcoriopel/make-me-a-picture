package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.Observer
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentToolsAdjustmentBinding
import com.example.prototype_mobile.model.connection.sign_up.model.Tool
import com.example.prototype_mobile.viewmodel.game.ColorViewModel
import com.example.prototype_mobile.viewmodel.game.ToolsAdjustmentViewModel

class ToolsAdjustmentFragment : Fragment() {
    companion object {
        fun newInstance() = ToolsAdjustmentFragment()
    }
    private lateinit var binding: FragmentToolsAdjustmentBinding
    private lateinit var viewModel: ToolsAdjustmentViewModel
    private lateinit var colorViewModel: ColorViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_tools_adjustment, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        viewModel = ViewModelProvider(this).get(ToolsAdjustmentViewModel::class.java)
        colorViewModel = ViewModelProvider(this).get(ColorViewModel::class.java)
        binding = FragmentToolsAdjustmentBinding.bind(view)


        viewModel.isGrid.observe(viewLifecycleOwner, Observer {
            if (it) {
                binding.sliderGridLayout.visibility = View.VISIBLE
            } else {
                binding.sliderGridLayout.visibility = View.GONE
            }
        })

        viewModel.selectedTool.observe(viewLifecycleOwner, Observer {
            if (it == Tool.PEN) {
                binding.sliderPenLayout.visibility = View.VISIBLE
                binding.sliderEraserLayout.visibility = View.GONE
                binding.sliderAlphaLayout.visibility = View.VISIBLE
            } else {
                binding.sliderPenLayout.visibility = View.GONE
                binding.sliderEraserLayout.visibility = View.VISIBLE
                binding.sliderAlphaLayout.visibility = View.GONE
            }
        })

        binding.sliderPen.addOnChangeListener { rangeSlider, value, fromUser ->
            viewModel.setPenSize(value.toInt())
        }

        binding.sliderEraser.addOnChangeListener { rangeSlider, value, fromUser ->
            viewModel.setEraserSize(value.toInt())
        }

        binding.sliderGrid.addOnChangeListener { rangeSlider, value, fromUser ->
            viewModel.setGridSize(value.toInt())
        }
        binding.sliderAlpha.addOnChangeListener { slider, value, fromUser ->
            colorViewModel.setAlpha(value.toInt())
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.resetAlpha()
    }

}