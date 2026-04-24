/*
 * Unless explicitly stated otherwise all files in this repository are licensed under the Apache License Version 2.0.
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2016-Present Datadog, Inc.
 */

package com.datadog.reactnative

import android.view.Choreographer

internal class FrameRateProvider(
    reactFrameRateCallback: ((Double) -> Unit),
    jsThreadExecutor: JsThreadExecutor
) {
    private val frameCallback: FpsFrameCallback = FpsFrameCallback(
        reactFrameRateCallback,
        jsThreadExecutor
    )

    fun start() {
        frameCallback.reset()
        frameCallback.start()
    }

    fun stop() {
        frameCallback.stop()
    }
}

internal class FpsFrameCallback(
    private val reactFrameRateCallback: ((Double) -> Unit),
    private val jsThreadExecutor: JsThreadExecutor
) : Choreographer.FrameCallback {

    private var choreographer: Choreographer? = null
    private var lastFrameTime = -1L

    override fun doFrame(time: Long) {
        if (lastFrameTime != -1L) {
            reactFrameRateCallback((time - lastFrameTime).toDouble())
        }
        lastFrameTime = time
        choreographer?.postFrameCallback(this)
    }

    fun start() {
        // Choreographer.getInstance() is bound to the calling thread's Looper, and frame callbacks
        // fire on that same thread. To measure JS frame timings (and to mirror the iOS
        // implementation, which adds the CADisplayLink to the JS thread's RunLoop), we MUST
        // register the choreographer on the React Native JS thread. Running this on the UI thread
        // would measure UI thread frames instead and miss long tasks / frozen frames caused by
        // JS work.
        jsThreadExecutor.runOnJsThread {
            try {
                val instance = Choreographer.getInstance()
                instance.removeFrameCallback(this@FpsFrameCallback)
                choreographer = instance
                instance.postFrameCallback(this@FpsFrameCallback)
            } catch (ignored: IllegalStateException) {
                // The React Native JS thread always has a Looper, but Choreographer.getInstance()
                // is documented to throw if the current thread has none, so guard defensively.
            }
        }
    }

    fun stop() {
        jsThreadExecutor.runOnJsThread {
            choreographer?.removeFrameCallback(this@FpsFrameCallback)
        }
    }

    fun reset() {
        lastFrameTime = -1L
    }
}
