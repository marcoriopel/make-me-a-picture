package com.example.prototype_mobile.view.game

import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import com.example.prototype_mobile.R
import com.example.prototype_mobile.databinding.FragmentColorBinding
import com.example.prototype_mobile.databinding.FragmentToolsBinding
import com.example.prototype_mobile.viewmodel.game.ColorViewModel
import org.jetbrains.anko.backgroundColor
import java.util.*

class ColorFragment : Fragment() {

    private lateinit var binding: FragmentColorBinding
    var primaryColor = Color.rgb(0, 0, 0)
    var colorList: IntArray = intArrayOf(
        Color.rgb(235, 87, 87),
        Color.rgb(242, 153, 74),
        Color.rgb(242, 201, 76),
        Color.rgb(33, 150, 83),
        Color.rgb(39, 174, 96),
        Color.rgb(47, 128, 237),
        Color.rgb(86, 204, 242),
        Color.rgb(155, 81, 224),
        Color.rgb(0, 0, 0)
    )
    var secondaryButtons: Vector<ImageView> = Vector<ImageView>()

    companion object {
        fun newInstance() = ColorFragment()
    }

    lateinit var viewModel: ColorViewModel

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_color, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(ColorViewModel::class.java)
        viewModel.setColor(primaryColor)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding = FragmentColorBinding.bind(view)
        binding.primaryColor.setOnClickListener {
            openColorPicker()
        }

        updateButtonColor(primaryColor)
        secondaryButtons.add(binding.secondary1)
        secondaryButtons.add(binding.secondary2)
        secondaryButtons.add(binding.secondary3)
        secondaryButtons.add(binding.secondary4)
        secondaryButtons.add(binding.secondary5)
        secondaryButtons.add(binding.secondary6)
        secondaryButtons.add(binding.secondary7)
        secondaryButtons.add(binding.secondary8)
        secondaryButtons.add(binding.secondary9)
        var i = 0
        for (button in secondaryButtons) {
            button.setColorFilter(colorList[i])
            button.setOnClickListener {
                swapColor(button)
            }
            i++
        }
    }

    private fun openColorPicker() {
        activity?.let {
            com.jaredrummler.android.colorpicker.ColorPickerDialog.newBuilder()
                .setColor(primaryColor)
                .setAllowPresets(false)
                .setDialogType(com.jaredrummler.android.colorpicker.ColorPickerDialog.TYPE_CUSTOM)
                .setDialogTitle(R.string.colorPickerToolTitle).show(it)

        }
    }

    fun updateButtonColor(color: Int) {
        binding.primaryColor.setColorFilter(color)
    }

    private fun swapColor(button: ImageView) {
        val index = secondaryButtons.indexOf(button)
        binding.primaryColor.setColorFilter(colorList[index])
        viewModel.setColor(colorList[index])
    }
}