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
    var colorList:IntArray = intArrayOf(
        Color.rgb(255, 0, 0),
        Color.rgb(0, 255, 0),
        Color.rgb(0, 0, 255),
        Color.rgb(255, 0, 255)
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
        binding.primaryColor.setOnClickListener{
            openColorPicker()
        }

        updateButtonColor(primaryColor)
        secondaryButtons.add(binding.secondary1)
        secondaryButtons.add(binding.secondary2)
        secondaryButtons.add(binding.secondary3)
        secondaryButtons.add(binding.secondary4)
        populateSecondaryColor(colorList)

        binding.secondary1.setOnClickListener{
            swapColor(binding.secondary1)
        }
        binding.secondary2.setOnClickListener{
            swapColor(binding.secondary2)
        }
        binding.secondary3.setOnClickListener{
            swapColor(binding.secondary3)
        }
        binding.secondary4.setOnClickListener{
            swapColor(binding.secondary4)
        }
    }

    private fun openColorPicker() {
        activity?.let{
            com.jaredrummler.android.colorpicker.ColorPickerDialog.newBuilder().setColor(primaryColor)
                .setAllowPresets(false).setDialogType(com.jaredrummler.android.colorpicker.ColorPickerDialog.TYPE_CUSTOM).setDialogTitle(R.string.colorPickerToolTitle).show(it)

        }
    }

    fun updateButtonColor(color: Int) {
        binding.primaryColor.setColorFilter(color)
        binding.secondary1.setColorFilter(color)
    }
    fun populateSecondaryColor(colors:IntArray){
        secondaryButtons.forEachIndexed { i, element ->
            element.setColorFilter(colors[i])
        }
    }
    //Since we don't have lots of button we will procede this way.
    // If we have more color use a for loop
    fun newColorSelectionArrayUpdate(color: Int) {
        val tempArray = IntArray(4)
        colorList.forEachIndexed { i, element ->
            if(i == 0) {
                tempArray[i]=color
            }
            else
                tempArray[i]=colorList[i-1]

        }
        colorList= tempArray
    }

    private fun swapColor(secondary:ImageView){

//        binding.primaryColor.setColorFilter() = secondary.background
//        secondary.background = ColorDrawable(primaryColor)
//        val background: android.graphics.drawable.Drawable? = binding.primaryColor.getBackground()
//        if (background is ColorDrawable) {
//            primaryColor = (background as ColorDrawable).color
//            viewModel.setColor(primaryColor)
//        }
//        updateListColor()
    }

    private fun updateListColor() {
        secondaryButtons.forEachIndexed { index, button ->
            val background: android.graphics.drawable.Drawable? = button.getBackground()
            if (background is ColorDrawable) {
                colorList[index] = (background as ColorDrawable).color

            }
        }
    }
}