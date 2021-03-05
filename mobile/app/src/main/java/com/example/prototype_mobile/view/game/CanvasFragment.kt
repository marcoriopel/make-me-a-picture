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



class CanvasFragment : Fragment() {

    private lateinit var viewModel: CanvasViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        if (container != null) {
            return MyCanvasView(container.context)
        };
        return inflater.inflate(R.layout.fragment_canvas, container, false)
    }

    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        viewModel = ViewModelProvider(this).get(CanvasViewModel::class.java)
    }

}