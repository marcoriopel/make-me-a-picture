package com.example.prototype_mobile.view.game

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import android.util.AttributeSet
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel


// Inspired by: https://developer.android.com/codelabs/advanced-android-kotlin-training-canvas#5
class CanvasFragment : Fragment() {

    val bitmap = Bitmap.createBitmap(800, 600, Bitmap.Config.ARGB_8888);
    val extrabitmap = Bitmap.createBitmap(800, 600, Bitmap.Config.ARGB_8888);
    val canvas = Canvas(bitmap);

    companion object {
        fun newInstance() = CanvasFragment()
        const val OFFSET = 0;
        const val MULTIPLIER = 0;
    }

    private lateinit var viewModel: CanvasViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        return inflater.inflate(R.layout.fragment_canvas, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(CanvasViewModel::class.java)
        // TODO: Use the ViewModel
    }

}