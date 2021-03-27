package com.example.prototype_mobile.view.game

import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.Nullable
import androidx.lifecycle.Observer
import com.example.prototype_mobile.R
import com.example.prototype_mobile.viewmodel.game.CanvasViewModel
import com.example.prototype_mobile.viewmodel.game.CanvasViewModelFactory
import com.example.prototype_mobile.viewmodel.game.GameViewModel


class CanvasFragment : Fragment() {

    private lateinit var canvasViewModel: CanvasViewModel

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        canvasViewModel = ViewModelProvider(this, CanvasViewModelFactory())
            .get(CanvasViewModel::class.java)
        if (container != null) {
            return MyCanvasView(container.context, canvasViewModel)
        };
        return inflater.inflate(R.layout.fragment_canvas, container, false)
    }

    override fun onViewCreated(view: View, @Nullable savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        canvasViewModel.newCurPath.observe(viewLifecycleOwner, Observer {
            view.invalidate()
        })
    }
}